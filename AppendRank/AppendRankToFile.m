function AppendRankToFile(modifiedFile, logFile, log)
    fileString = [];
    
    lid = fopen(logFile, 'r');
    %log = [];
    lineCount = 0;
    mid = fopen(modifiedFile, 'w');
    while ~feof(lid)
        lineCount = lineCount + 1;
        line = fgets(lid);
        endBracketLoc = strfind(line, '}');
        if isempty(log(lineCount).rank)
            rankStr = strcat(',"rank":""}');
        else
            rankStr = strcat(',"rank":"', num2str(log(lineCount).rank), '"}');
        end
        line = strcat(line(1:endBracketLoc-1), rankStr);
        fprintf(mid, '%s\n', line);
    end  
    fclose(mid);
end