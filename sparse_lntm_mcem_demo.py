#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Logistic-normal topic models using Monte-Carlo EM
Dense implementation, O(DKV)
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import division
import sys
import os
import time
import json

import tensorflow as tf
from six.moves import range
import numpy as np
import zhusuan as zs

from examples import conf
from examples.utils import dataset
from sdd import *
from srsc import *

from scipy.sparse import csr_matrix, load_npz


# corresponding to eta in LDA. Larger log_delta leads to sparser topic.
log_delta = 10.0


def lntm(observed, n_chains, D, K, V, eta_mean, eta_logstd):
    with zs.BayesianNet(observed=observed) as model:
        eta_mean = tf.tile(tf.expand_dims(eta_mean, 0), [D, 1])
        eta = zs.Normal('eta', eta_mean, logstd=eta_logstd, n_samples=n_chains,
                        group_ndims=1)
        beta = zs.Normal('beta', tf.zeros([K, V]), logstd=log_delta,
                         group_ndims=1)
    return model


def get_indices_and_values(X):
    X = X.tocoo()
    indices = np.transpose(np.array([X.row, X.col])).astype(np.int64)
    values = X.data
    p = np.lexsort((indices[:, 1], indices[:, 0]))
    # print(p)
    return indices[p, :], values[p]


if __name__ == "__main__":
    tf.set_random_seed(1237)
    np.random.seed(2345)

    # Load nips dataset
    # X = load_npz('nips.npz')
    path, basename = sys.argv[1], sys.argv[2]
    X = load_npz(os.path.join(path, f'{basename}.npz'))
    # with open('nips_vocab.txt') as vf:
    with open(os.path.join(path, f'{basename}_vocab.txt'), 'r') as vf:
        vocab = [v.strip() for v in vf.readlines()]
    with open(os.path.join(path, f'{basename}-filename.json'), 'r') as jf:
        filename = json.load(jf)
    X_train = X

    # Define model training/evaluation parameters
    D = 200
    K = 100
    V = X_train.shape[1]
    n_chains = 1

    num_e_steps = 5
    hmc = zs.HMC(step_size=1e-3, n_leapfrogs=20, adapt_step_size=True,
                 target_acceptance_rate=0.6)
    epochs = 60
    learning_rate_0 = 1.0
    t0 = 10

    T = X_train.sum()
    iters = X_train.shape[0] // D
    Eta = np.zeros((n_chains, X_train.shape[0], K), dtype=np.float32)
    Eta_mean = np.zeros(K, dtype=np.float32)
    Eta_logstd = np.zeros(K, dtype=np.float32)

    # Build the computation graph
    x_indices = tf.placeholder(tf.int64, shape=[None, 2], name='x_indices')
    x_values = tf.placeholder(tf.float32, shape=[None], name='x_values')
    eta_mean = tf.placeholder(tf.float32, shape=[K], name='eta_mean')
    eta_logstd = tf.placeholder(tf.float32, shape=[K], name='eta_logstd')
    eta = tf.Variable(tf.zeros([n_chains, D, K]), name='eta')
    eta_ph = tf.placeholder(tf.float32, shape=[n_chains, D, K], name='eta_ph')
    beta = tf.Variable(tf.zeros([K, V]), name='beta')
    phi = tf.nn.softmax(beta)
    init_eta_ph = tf.assign(eta, eta_ph)

    D_ph = tf.placeholder(tf.int32, shape=[], name='D_ph')
    n_chains_ph = tf.placeholder(tf.int32, shape=[], name='n_chains_ph')

    def sparse_tile(indices, values, dense_shape, n_rep):
        '''
        # TODO don't convert to dense
        # Convert to dense
        #dense_shape = tf.Print(dense_shape, [dense_shape, indices], 'Dense shape')
        dense_t = tf.sparse_to_dense(indices, dense_shape, values)
        # Tile
        dense_t = tf.tile(dense_t, [n_rep, 1])
        # Convert back
        tiled_indices = tf.where(dense_t > 0)
        tiled_values = tf.tile(values, [n_rep])
        return tiled_indices, tiled_values
        '''
        tiled_indices = indices
        i = tf.constant(1, dtype=tf.int64)

        def c(idx, i): return i < tf.cast(n_rep, tf.int64)

        def b(idx, i):
            nrow = [dense_shape[0] * i, 0]
            tempidx = indices + nrow
            return (tf.concat([idx, tempidx], 0), i + 1)
        tiled_indices, _ = tf.while_loop(c, b, [tiled_indices, i])
        return tiled_indices, tf.tile(values, [n_rep])

    def joint_obj(observed):
        model = lntm(observed, n_chains_ph, D_ph, K, V, eta_mean, eta_logstd)

        log_p_eta, log_p_beta = \
            model.local_log_prob(['eta', 'beta'])

        theta = tf.nn.softmax(observed['eta'])
        theta = tf.reshape(theta, [-1, K])
        phi = tf.nn.softmax(observed['beta'])

        x_indices = observed['x_indices']
        x_values = observed['x_values']
        dense_shape = tf.cast(tf.stack([D_ph, V]), tf.int64)
        x_indices, x_values = sparse_tile(
            x_indices, x_values, dense_shape, n_chains_ph)

        log_pred = logsdd(theta, phi, x_indices)
        log_pred = log_pred * x_values
        dense_shape = tf.cast(tf.stack([n_chains_ph*D_ph, V]), tf.int64)
        #z_indices = tf.reshape(x_indices, [tf.size(log_pred), 2])
        #z_indices = tf.contrib.framework.sort(z_indices, axis=0)
        #z_indices = tf.reshape(z_indices, [tf.size(log_pred) * 2])
        #row_idx = [t for i, t in enumerate(x_indices) if i // 2 == 0]
        # print(row_idx.sorted())
        #log_pred = tf.SparseTensor(indices=x_indices, values=log_pred, dense_shape=dense_shape)
        #log_px = tf.sparse_reduce_sum(log_pred, -1)
        log_px_cuda = srsc(log_pred, x_indices, dense_shape)
        log_px_cuda = tf.reshape(log_px_cuda, [n_chains_ph, D_ph])
        #log_px = tf.reduce_sum(tf.scatter_nd(x_indices, log_pred, dense_shape), -1)
        #log_px = tf.reshape(log_px, [n_chains_ph, D_ph])
        #log_px = tf.Print(log_px, [tf.reduce_sum(lp), tf.reduce_sum(lp2), tf.reduce_sum(log_px)], 'log_px')

        # Shape:
        # log_p_eta, log_px: [n_chains, D]
        # log_p_beta: [K]
        return log_p_eta, log_p_beta, log_px_cuda

    def e_obj(observed):
        log_p_eta, _, log_px_cuda = joint_obj(observed)
        return log_p_eta + log_px_cuda

    lp_eta, lp_beta, lp_x_cuda = joint_obj(
        {'x_indices': x_indices, 'x_values': x_values, 'eta': eta, 'beta': beta})
    #log_likelihood = tf.reduce_sum(tf.reduce_mean(lp_x, axis=0), axis=0)
    log_likelihood_cuda = tf.reduce_sum(tf.reduce_mean(lp_x_cuda, axis=0),
                                        axis=0)
    log_joint = tf.reduce_sum(lp_beta) + log_likelihood_cuda
    sample_op, hmc_info = hmc.sample(
        e_obj, observed={'x_indices': x_indices, 'x_values': x_values, 'beta': beta}, latent={'eta': eta})

    learning_rate_ph = tf.placeholder(tf.float32, shape=[], name='lr')
    optimizer = tf.train.AdamOptimizer(learning_rate_ph)
    infer = optimizer.minimize(-log_joint, var_list=[beta])

    params = tf.trainable_variables()
    for i in params:
        print(i.name, i.get_shape())

    # Run the inference
    with tf.Session() as sess:
        sess.run(tf.global_variables_initializer())

        for epoch in range(1, epochs + 1):
            time_epoch = -time.time()
            learning_rate = learning_rate_0 / (t0 + epoch) * t0
            perm = list(range(X_train.shape[0]))
            np.random.shuffle(perm)
            X_train = X_train[perm, :]
            Eta = Eta[:, perm, :]
            # filename = filename[perm]
            filename = [filename[i] for i in perm]
            lls = []
            #lls_cuda = []
            accs = []
            for t in range(iters):
                x_batch = X_train[t * D: (t + 1) * D]
                x_batch_indices, x_batch_values = get_indices_and_values(
                    x_batch)
                old_eta = Eta[:, t * D:(t + 1) * D, :]
                # print(x_batch_indices)
                # print(x_batch_values)

                # E step
                sess.run(init_eta_ph, feed_dict={eta_ph: old_eta})
                for j in range(num_e_steps):
                    # print(j)
                    _, new_eta, acc = sess.run(
                        [sample_op, hmc_info.samples['eta'],
                         hmc_info.acceptance_rate],
                        feed_dict={x_indices: x_batch_indices, x_values: x_batch_values,
                                   eta_mean: Eta_mean,
                                   eta_logstd: Eta_logstd,
                                   D_ph: D,
                                   n_chains_ph: n_chains})
                    accs.append(acc)
                    # Store eta for the persistent chain
                    if j + 1 == num_e_steps:
                        Eta[:, t * D:(t + 1) * D, :] = new_eta

                # M step
                _, ll = sess.run(
                    [infer, log_likelihood_cuda],
                    feed_dict={x_indices: x_batch_indices, x_values: x_batch_values,
                               eta_mean: Eta_mean,
                               eta_logstd: Eta_logstd,
                               learning_rate_ph: learning_rate * t0 / (
                                   t0 + epoch),
                               D_ph: D,
                               n_chains_ph: n_chains})
                lls.append(ll)
                # lls_cuda.append(ll_cuda)

            # Update hyper-parameters
            Eta_mean = np.mean(Eta, axis=(0, 1))
            Eta_logstd = np.log(np.std(Eta, axis=(0, 1)) + 1e-6)

            time_epoch += time.time()
            print('Epoch {} ({:.1f}s): Perplexity = {:.2f}, acc = {:.3f}, '
                  'eta mean = {:.2f}, logstd = {:.2f}'
                  .format(epoch, time_epoch, np.exp(-np.sum(lls) / T),
                          #np.exp(-np.sum(lls_cuda) / T),
                          np.mean(accs), np.mean(Eta_mean),
                          np.mean(Eta_logstd)))

        # Output topics
        p = sess.run(phi)
        for k in range(K):
            rank = list(zip(list(p[k, :]), range(V)))
            rank.sort()
            rank.reverse()
            sys.stdout.write('Topic {}, eta mean = {:.2f} stdev = {:.2f}: '
                             .format(k, Eta_mean[k], np.exp(Eta_logstd[k])))
            for i in range(10):
                sys.stdout.write(vocab[rank[i][1]] + ' ')
            sys.stdout.write('\n')

        THETA = sess.run(tf.nn.softmax(tf.squeeze(Eta)))
        # print(tf.shape(THETA), len(filename))
        # th_result = list(THETA)
        # print(len(th_result), len(th_result[0]))
        docfile = os.path.join(path, f'{basename}-doc-topic.json')
        dt = []
        for i in range(len(filename)):
            temp = list(THETA[i, :])
            dt.append({
                'file': filename[i],
                'topics': [float(j) for j in temp]
            })
        with open(docfile, 'w+') as jfile:
            json.dump(dt, jfile)
