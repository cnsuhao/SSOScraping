python ./new.py 600k-610k.csv 600-610k_log.txt | tee -a 600k-610k_new.csv
python ./new.py 610k-620k.csv 610-620k_log.txt | tee -a 610k-620k_new.csv
python ./new.py 620k-630k.csv 620-630k_log.txt | tee -a 620k-630k_new.csv
python ./new.py 630k-640k.csv 630-640k_log.txt | tee -a 630k-640k_new.csv
python ./new.py 640k-650k.csv 640-650k_log.txt | tee -a 640k-650k_new.csv
python ./new.py 650k-660k.csv 650-660k_log.txt | tee -a 650k-660k_new.csv
python ./new.py 660k-670k.csv 660-670k_log.txt | tee -a 660k-670k_new.csv
python ./new.py 670k-680k.csv 670-680k_log.txt | tee -a 670k-680k_new.csv
python ./new.py 680k-690k.csv 680-690k_log.txt | tee -a 680k-690k_new.csv
python ./new.py 690k-700k.csv 690-700k_log.txt | tee -a 690k-700k_new.csv
python ./new.py 700k-710k.csv 700-710k_log.txt | tee -a 700k-710k_new.csv
python ./new.py 710k-720k.csv 710-720k_log.txt | tee -a 710k-720k_new.csv
python ./new.py 720k-730k.csv 720-730k_log.txt | tee -a 720k-730k_new.csv
python ./new.py 730k-740k.csv 730-740k_log.txt | tee -a 730k-740k_new.csv
python ./new.py 740k-750k.csv 740-750k_log.txt | tee -a 740k-750k_new.csv
python ./new.py 750k-760k.csv 750-760k_log.txt | tee -a 750k-760k_new.csv
python ./new.py 760k-770k.csv 760-770k_log.txt | tee -a 760k-770k_new.csv
python ./new.py 770k-780k.csv 770-780k_log.txt | tee -a 770k-780k_new.csv
python ./new.py 780k-790k.csv 780-790k_log.txt | tee -a 780k-790k_new.csv
python ./new.py 790k-800k.csv 790-800k_log.txt | tee -a 790k-800k_new.csv

python ./split10k.py 600k-610k.csv 600000 610000
python ./split10k.py 610k-620k.csv 610000 620000
python ./split10k.py 620k-630k.csv 620000 630000
python ./split10k.py 630k-640k.csv 630000 640000
python ./split10k.py 640k-650k.csv 640000 650000
python ./split10k.py 650k-660k.csv 650000 660000
python ./split10k.py 660k-670k.csv 660000 670000
python ./split10k.py 670k-680k.csv 670000 680000
python ./split10k.py 680k-690k.csv 680000 690000
python ./split10k.py 690k-700k.csv 690000 700000
python ./split10k.py 700k-710k.csv 700000 710000
python ./split10k.py 710k-720k.csv 710000 720000
python ./split10k.py 720k-730k.csv 720000 730000
python ./split10k.py 730k-740k.csv 730000 740000
python ./split10k.py 740k-750k.csv 740000 750000
python ./split10k.py 750k-760k.csv 750000 760000
python ./split10k.py 760k-770k.csv 760000 770000
python ./split10k.py 770k-780k.csv 770000 780000
python ./split10k.py 780k-790k.csv 780000 790000
python ./split10k.py 790k-800k.csv 790000 800000