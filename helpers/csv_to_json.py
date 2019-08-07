# !/usr/bin/env/python3
# csv_to_json.py

import csv
import sys
import json

def getInput():
    if(len(sys.argv) >1):
        return sys.argv[1]
    else:
        print("usage: python3 process-csv.py <filename>.csv \n output: <filename>-info.json")
        exit()

def process():
    input_csv = getInput()
    if (not input_csv):
        print("input errror")
        exit()
    filename = input_csv[0:input_csv.find(".csv")]
    print(filename)

    info = []

    # read in csv file
    with open(input_csv, 'r') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        n = 0

        for row in csv_reader:
            if n==0: # first row, labels
                print(row)
            elif n==1: # map info
                print(row)
                c_lat = row[0]
                c_lng = row[1]
                b_north = row[2]
                b_south = row[3]
                b_west = row[4]
                b_east = row[5]
            elif n==2:  # sounds info labels
                print(row)
            else: # sounds info
                lat = float(row[0])
                lng = float(row[1])
                descrip = row[2]
                place = row[3]
                fname = row[4]

                info.append({"filename":fname, 
                    "pos":{"lat":lat,"lng":lng}, 
                    "descrip":descrip
                    })
            n += 1

    sounds_info = {
        "center": {"lat": c_lat, "lng": c_lng},
        "bounds": {"north":b_north, "south": b_south, "west": b_west, "east": b_east},
        "sounds": info
        }

    # write to json output
    with open(filename + '-info.json', 'w') as outfile:
        json.dump(sounds_info, outfile)

    # javascript, hacky way to do this
    with open(filename + '-info.js', 'w') as outfile:
        outfile.write("var soundsInfoFromFile = ")
        outfile.write(json.dumps(sounds_info, ensure_ascii=False, indent=2))
        #outfile.write(json.dumps(sounds_info,indent=2))
        # outfile.write(json.dumps(sounds_info))
        # for l in info:
            # outfile.writelines(json.dumps(l)) 
        outfile.write(";")
        # outfile.write(";\nvar SOUNDS_INFO = soundsInfoFromFile['info'];");



process()
print("done")
