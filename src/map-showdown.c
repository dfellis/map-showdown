#include <stdlib.h>
#include <stdio.h>
#include <time.h>

const int ARRLEN = 100000000;

void perfPrint(char* name, clock_t start, clock_t end) {
    int time = (end - start) / 1000;
    double speed = 1000 * (double)(ARRLEN) / (double)(time);
    printf("%s perf: %dms, speed %f items/sec\n", name, time, speed);
}

int main() {
    int* testArray = malloc(ARRLEN*sizeof(int));
    for(int i = 0; i < ARRLEN; i++) {
        testArray[i] = i;
    }

    int* outFor = malloc(ARRLEN*sizeof(int));
    clock_t startFor = clock();
    for(int i = 0; i < ARRLEN; i++) {
        outFor[i] = 2*testArray[i]+1;
    }
    clock_t endFor = clock();
    perfPrint("C for", startFor, endFor);
    return 0;
}