import time
import json
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from crypto.bbs_mock import BbsMock
from crypto.predicate_eval import PredicateEvaluator
from hashlib import sha256

def run_benchmarks():
    print("--- ZKP Backend Benchmarks ---")
    
    # Setup
    pk, sk = BbsMock.generate_keys()
    attributes_small = {"name": "Test", "age": "25"}
    attributes_large = {f"attr_{i}": f"value_{i}" for i in range(20)}
    
    # 1. Signing Benchmark
    start = time.time()
    for _ in range(100):
        BbsMock.sign(attributes_small, sk)
    end = time.time()
    avg_sign = (end - start) / 100 * 1000
    print(f"Signing (2 attrs): {avg_sign:.4f} ms")
    
    start = time.time()
    for _ in range(100):
        BbsMock.sign(attributes_large, sk)
    end = time.time()
    avg_sign_large = (end - start) / 100 * 1000
    print(f"Signing (20 attrs): {avg_sign_large:.4f} ms")

    # 2. Proof Verification Benchmark (Mock)
    # Mock proof generation
    proof = str(sha256(b"mock_proof").hexdigest())
    revealed = {"age": "25"}
    
    start = time.time()
    for _ in range(100):
        BbsMock.verify_proof("mock_proof_valid", pk, revealed)
    end = time.time()
    avg_verify = (end - start) / 100 * 1000
    print(f"Verify Proof (Mock): {avg_verify:.4f} ms")
    
    # 3. Predicate Evaluation
    with open(os.path.join(os.path.dirname(__file__), "predicates.json")) as f:
        predicates = json.load(f)
        
    test_attrs = {"age": 25, "birthdate": "2000-01-01", "state": "CA"}
    
    start = time.time()
    for _ in range(1000):
        for p in predicates:
            PredicateEvaluator.evaluate(p, test_attrs)
    end = time.time()
    avg_eval = (end - start) / 1000 * 1000 / len(predicates)
    print(f"Predicate Eval (Avg): {avg_eval:.4f} ms")

if __name__ == "__main__":
    run_benchmarks()
