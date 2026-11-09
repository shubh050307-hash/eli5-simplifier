// Demo fallback data for when backend is offline
export const DEMO_RESPONSES = {
  '__default__': {
    eli5: `Imagine you have a magic toy box that can answer any question you ask it! 🎁

Scientists and engineers built super-smart computer brains called AI. These brains read millions of books and learned from them, just like you learn from your teacher.

When you ask a question, the AI brain thinks really hard — like a puzzle — and writes you an answer using everything it learned.

**Core Idea:** An AI is a computer that learned from tons of books so it can answer questions and help people!`,

    teen: `AI systems like the one powering this app use something called a Large Language Model (LLM). Think of it like a really sophisticated autocomplete — trained on billions of text examples from the internet, books, and articles.

During training, the model learns statistical patterns: which words follow which other words, and which concepts relate to each other. When you type a question, it generates a response token-by-token, predicting the most contextually appropriate next word each time.

The result? Answers that feel surprisingly human, because the training data *was* human-generated.

**Key Takeaway:** LLMs are prediction engines trained on massive text datasets — they don't "think" like humans, but they're incredibly good at pattern-matching language.`,

    expert: `Large Language Models (LLMs) are autoregressive transformer architectures trained via next-token prediction on web-scale corpora (typically 1T+ tokens). The attention mechanism enables the model to weight contextual relevance across the entire input sequence via Q·K^T/√d_k softmax operations.

Fine-tuning via RLHF (Reinforcement Learning from Human Feedback) aligns base model outputs with human preference distributions. Inference involves sampling from the model's output probability distribution, with temperature and top-p parameters controlling entropy.

The system prompt establishes a behavioral constraint manifold that biases generation toward desired output characteristics without gradient updates — purely through in-context conditioning.

**Executive Summary:** LLMs are transformer-based probabilistic text generators; this application uses RLHF-aligned models with structured system prompts to enforce multi-register output formatting across distinct cognitive audience profiles.`
  },

  'Explain Zero-Knowledge Proofs': {
    eli5: `Imagine you found Waldo in a Where's Waldo book, but you want to prove to your friend you found him WITHOUT showing them where! 🔍

You could put a big piece of cardboard with a tiny hole over the page — you show just Waldo through the hole, so your friend sees Waldo but can't see where on the page he is.

You proved you know the answer... without giving away the secret!

**Core Idea:** Zero-Knowledge Proofs let you prove you know a secret without ever revealing what the secret actually is.`,

    teen: `Zero-Knowledge Proofs (ZKPs) solve a cool problem: how do you convince someone you know something without actually telling them what it is?

Classic example: You want to log into a website and prove you know your password — but you don't want to send the password itself (what if the website gets hacked?). With a ZKP, you can mathematically prove "I know the password" without transmitting the password.

This is huge in blockchain tech — it lets you verify transactions are valid without revealing transaction amounts or who's involved.

**Key Takeaway:** ZKPs use cryptographic math to prove knowledge without disclosure — it's privacy-preserving verification, and it's fundamental to modern blockchain privacy systems.`,

    expert: `Zero-Knowledge Proofs are cryptographic protocols satisfying three properties: **Completeness** (honest prover convinces verifier), **Soundness** (dishonest prover cannot fake proof beyond negligible probability), and **Zero-Knowledge** (verifier learns nothing beyond the truth of the statement).

Modern ZKP systems include zk-SNARKs (Succinct Non-interactive Arguments of Knowledge) using elliptic curve pairings, and zk-STARKs (Scalable Transparent ARguments of Knowledge) which are quantum-resistant and require no trusted setup. Proof generation involves arithmetization of computation into polynomial constraints (R1CS or PLONKish), followed by polynomial commitment schemes.

Applications: zkEVM rollups for Ethereum scaling (Polygon zkEVM, zkSync Era), private DeFi (Tornado Cash architecture), identity verification without data exposure.

**Executive Summary:** ZKPs are probabilistic cryptographic protocols enabling statement verification with zero information leakage; contemporary SNARK/STARK constructions achieve O(log n) proof size via polynomial commitment schemes and are production-deployed in Layer-2 blockchain scaling infrastructure.`
  }
};
