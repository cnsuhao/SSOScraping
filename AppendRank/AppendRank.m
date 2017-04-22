clear all; close all; warning off; clc;

logFile = '27k-32k.csv_log.txt';
rankFile = '27k-32k.csv';
modifiedFile = '27k-32k.csv_log_modified.txt';

disp('Reading Files....');
[rank, log] = ExtractData(logFile, rankFile);

disp('Matching Ranks....');
log = MatchRank(rank, log);

disp('Appending ranks to a new file....');
AppendRankToFile(modifiedFile, logFile, log);


