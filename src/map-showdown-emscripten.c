#include <stdlib.h>
#include <stdio.h>
#include <time.h>

const int ARRLEN = 1000000;

void perfPrint(char* name, clock_t start, clock_t end) {
    int time = (end - start) / (CLOCKS_PER_SEC / 1000);
    double speed = (double)(CLOCKS_PER_SEC) * (double)(ARRLEN) / (double)(time);
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
    perfPrint("Emscripten-ified C for", startFor, endFor);
    return 0;
}