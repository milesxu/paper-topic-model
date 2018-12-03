import os

base_data_path = 'data'

year_dir = [name for name in os.listdir(
    os.path.join(os.getcwd(), base_data_path))
    if os.path.isdir(os.path.join(os.getcwd(), base_data_path, name))]

for name in year_dir:
    parent_dir = os.path.join(os.getcwd(), base_data_path, name)
    pdf_dir = os.path.join(parent_dir, 'pdf')
    txt_dir = os.path.join(parent_dir, 'txt')
    if not os.path.isdir(pdf_dir):
        continue
    if not os.path.isdir(txt_dir):
        os.mkdir(txt_dir)
    pdf_files = os.listdir(pdf_dir)
    txt_files = os.listdir(txt_dir)
    for pdf_file in pdf_files:
        txt_file = pdf_file[0:-3] + 'txt'
        if txt_file in txt_files:
            continue
        pdf_path = os.path.join(pdf_dir, pdf_file)
        txt_path = os.path.join(txt_dir, txt_file)
        cmd = "pdftotext %s %s" % (pdf_path, txt_path)
        os.system(cmd)
        print(txt_path)
