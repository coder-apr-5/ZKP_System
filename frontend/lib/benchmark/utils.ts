export interface BenchmarkResult {
    timestamp: string;
    environment: {
        platform: string;
        userAgent: string;
    };
    metrics: {
        issuance?: number;
        proofGeneration?: number;
        verification?: number;
        proofSize?: number;
    };
}

export const benchmark = {
    measure: async <T>(label: string, fn: () => Promise<T>): Promise<{ result: T, time: number }> => {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`[Benchmark] ${label}: ${(end - start).toFixed(2)}ms`);
        return { result, time: end - start };
    },

    export: (metrics: any) => {
        const report: BenchmarkResult = {
            timestamp: new Date().toISOString(),
            environment: {
                platform: navigator.platform,
                userAgent: navigator.userAgent
            },
            metrics
        };
        return JSON.stringify(report, null, 2);
    }
};
