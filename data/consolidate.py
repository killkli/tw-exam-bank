import json

with open('exam-questions.json', 'r') as f:
    data = json.load(f)

# Define the consolidation mapping
consolidation_map = {
    # Reading Comprehension - Main categories
    "main idea": "main idea",
    "topic identification": "topic identification",
    
    # Detail comprehension
    "detail comprehension": "detail comprehension",
    "factual details": "factual details",
    "fact extraction": "factual details",
    "detail extraction": "factual details",
    "detail retrieval": "factual details",
    "info extraction": "info extraction",
    "information retrieval": "info extraction",
    
    # Inference
    "reading inference": "reading inference",
    "contextual inference": "reading inference",
    "negative inference": "reading inference",
    "inference": "reading inference",
    "character inference": "reading inference",
    "emotional inference": "reading inference",
    "logical deduction": "reading inference",
    
    # Author perspective
    "author perspective": "author's perspective",
    "author's perspective": "author's perspective",
    "author's purpose": "author's purpose",
    "opinion comprehension": "author's perspective",
    "opinion extraction": "author's perspective",
    
    # Article/comprehension types
    "reading comprehension": "general comprehension",
    "general comprehension": "general comprehension",
    "advertisement reading": "advertisement/poster reading",
    "news article reading": "news article reading",
    "news reading": "news article reading",
    "letter comprehension": "letter/email comprehension",
    "menu comprehension": "menu/comic reading",
    "story comprehension": "story/narrative comprehension",
    "conversation understanding": "dialogue/conversation comprehension",
    "dialogue comprehension": "dialogue/conversation comprehension",
    "chart comprehension": "chart/graph comprehension",
    "data interpretation": "chart/graph comprehension",
    "statistical comprehension": "chart/graph comprehension",
    "visual information integration": "chart/graph comprehension",
    
    # Comparative reading
    "comparative reading": "comparative reading",
    "comparative analysis": "comparative reading",
    "comparative reasoning": "comparative reading",
    "regional comparison": "comparative reading",
    
    # Critical/thematic analysis
    "cause and effect": "cause and effect",
    "contrast relationships": "contrast relationships",
    "evaluating evidence": "evaluating evidence",
    "sequence of events": "sequence/chronology",
    "historical sequence": "sequence/chronology",
    "temporal reasoning": "sequence/chronology",
    "trend analysis": "trend analysis",
    "moral/lesson identification": "moral/lesson identification",
    "character analysis": "character analysis",
    "character understanding": "character understanding",
    "text structure analysis": "text structure",
    "summary": "summary",
    "critical analysis": "critical analysis",
    "poetry interpretation": "poetry interpretation",
    
    # Listening
    "listening comprehension": "listening comprehension",
    
    # Cloze test
    "cloze test": "cloze test",
    
    # Spatial reasoning
    "spatial reasoning": "spatial reasoning",
    
    # Vocabulary & Meaning
    "vocabulary in context": "vocabulary in context",
    "context clues": "context clues",
    "contextual meaning": "contextual meaning",
    "word meaning": "word meaning",
    "adverb meaning": "adverb meaning",
    
    # Time expressions
    "time expressions": "time expressions",
    
    # Specific vocabulary topics
    "season vocabulary": "vocabulary in context",
    "body parts": "vocabulary in context",
    "cooking terminology": "vocabulary in context",
    "emotion description": "vocabulary in context",
    "service vocabulary": "vocabulary in context",
    "health science": "vocabulary in context",
    "professions": "vocabulary in context",
    "weather phenomena": "vocabulary in context",
    "food waste": "vocabulary in context",
    "food waste stages": "vocabulary in context",
    "logistics": "vocabulary in context",
    "environmental article": "vocabulary in context",
    "global issues": "vocabulary in context",
    "historical facts": "vocabulary in context",
    
    # Figurative language
    "metaphor": "metaphors/figurative language",
    "metaphors": "metaphors/figurative language",
    "anagrams": "word play",
    
    # Idioms and phrasal verbs
    "idioms": "idioms",
    "idiomatic expression": "idioms",
    "idiomatic expressions": "idioms",
    "phrasal verbs": "phrasal verbs",
    
    # Word forms - Nouns
    "nouns": "nouns",
    "noun forms": "nouns",
    "noun identification": "nouns",
    "noun meanings": "nouns",
    "noun patterns": "nouns",
    
    # Word forms - Verbs
    "verbs": "verbs",
    "verb patterns": "verbs",
    "verb meanings": "verbs",
    "verb selection": "verbs",
    "verb tenses": "verb tenses",
    
    # Word forms - Adjectives
    "adjectives": "adjectives",
    "superlative adjectives": "superlatives",
    "comparatives": "comparatives",
    
    # Word forms - Adverbs
    "adverbs": "adverbs",
    
    # Grammar & Structure - Tenses
    "present simple": "present simple",
    "past simple": "past simple",
    "present perfect": "present perfect",
    "past continuous": "past continuous",
    "past perfect": "past perfect",
    "future simple": "future simple",
    "future tense": "future tense",
    "future tense markers": "future tense markers",
    "present continuous": "present continuous",
    "past simple in time clause": "past simple",
    "past simple vs future forms": "tense comparison",
    "past simple vs present perfect": "tense comparison",
    "present perfect vs past continuous": "tense comparison",
    "present simple vs will": "tense comparison",
    
    # Subject-verb agreement
    "subject-verb agreement": "subject-verb agreement",
    
    # Pronouns
    "pronouns": "pronouns",
    "possessive pronouns": "possessive pronouns",
    "reflexive pronouns": "reflexive pronouns",
    "indefinite pronouns": "indefinite pronouns",
    "double possessives": "possessive forms",
    "pronoun reference": "pronoun reference",
    
    # Determiners and quantifiers
    "determiners": "determiners",
    "quantifiers": "quantifiers",
    
    # There is/are
    "there is/are": "there is/are",
    "there is/there are": "there is/are",
    
    # Prepositions
    "prepositions": "prepositions",
    
    # Conjunctions
    "conjunctions": "conjunctions",
    "connectors": "conjunctions",
    "logical connectors": "conjunctions",
    "contrast connectors": "conjunctions",
    "coordinating conjunctions": "conjunctions",
    "subordinating conjunctions": "conjunctions",
    
    # Subordinate clauses
    "subordinate clauses": "subordinate clauses",
    "subordinating clauses": "subordinate clauses",
    "relative clauses": "relative clauses",
    "time clauses": "time clauses",
    "when clause": "time clauses",
    "because clause": "because clause",
    
    # Conditionals
    "conditional sentences": "conditionals",
    "first conditional": "conditionals",
    
    # Passive voice
    "passive voice": "passive voice",
    
    # Gerunds and infinitives
    "gerunds": "gerunds",
    "gerund": "gerunds",
    "gerund as subject": "gerunds",
    "infinitive": "infinitives",
    "infinitive vs gerund": "infinitives vs gerunds",
    
    # Modal verbs
    "modals": "modals",
    
    # Imperative
    "imperative": "imperative",
    
    # Tag questions
    "tag questions": "tag questions",
    
    # Ellipsis and omission
    "ellipsis": "ellipsis",
    "do replacement": "do replacement",
    "verb omission": "verb omission",
    
    # Used to / past habits
    "used to": "used to",
    "past habits": "past habits",
    
    # Exception expressions
    "exception expressions": "exception expressions",
    
    # Argument structure
    "argument structure": "argument structure",
    
    # WH questions
    "wh questions": "wh questions",
    "question words": "wh questions",
    "question formation": "wh questions",
    
    # Numbers and calculations
    "numbers": "numbers",
    "numerical calculation": "numerical reasoning",
    "numerical reasoning": "numerical reasoning",
    
    # Schedule interpretation
    "schedule interpretation": "schedule interpretation",
    
    # Instruction following
    "instruction following": "instruction following",
    
    # Grammar structures (catch-all)
    "grammar structures": "grammar structures",
}

# Define categories with canonical concepts
categories = {
    "Reading Comprehension": {
        "description": "Questions testing understanding of written texts including main ideas, details, inference, author perspective, and various text types",
        "canonical": [
            "main idea", "topic identification", "detail comprehension", "factual details", 
            "info extraction", "reading inference", "author's perspective", "author's purpose",
            "general comprehension", "advertisement/poster reading", "news article reading",
            "letter/email comprehension", "menu/comic reading", "story/narrative comprehension",
            "dialogue/conversation comprehension", "chart/graph comprehension", "comparative reading",
            "cause and effect", "contrast relationships", "evaluating evidence", "sequence/chronology",
            "trend analysis", "moral/lesson identification", "character analysis", "character understanding",
            "text structure", "summary", "critical analysis", "poetry interpretation", "listening comprehension",
            "cloze test", "spatial reasoning"
        ]
    },
    "Vocabulary & Meaning": {
        "description": "Questions testing word meanings, context clues, idioms, metaphors, and word forms",
        "canonical": [
            "vocabulary in context", "context clues", "contextual meaning", "word meaning", 
            "adverb meaning", "metaphors/figurative language", "idioms", "phrasal verbs",
            "nouns", "verbs", "adjectives", "adverbs", "comparatives", "superlatives", "word play",
            "time expressions"
        ]
    },
    "Grammar & Structure": {
        "description": "Questions testing grammatical structures including tenses, clauses, voice, and sentence formation",
        "canonical": [
            "present simple", "past simple", "present perfect", "past continuous", 
            "past perfect", "future simple", "future tense", "future tense markers",
            "present continuous",
            "subject-verb agreement", "pronouns", "possessive pronouns", "reflexive pronouns",
            "indefinite pronouns", "pronoun reference", "determiners", "quantifiers",
            "there is/are", "prepositions", "conjunctions", "subordinate clauses",
            "relative clauses", "time clauses", "because clause", "conditionals",
            "passive voice", "gerunds", "infinitives", "infinitives vs gerunds",
            "modals", "imperative", "tag questions", "ellipsis", "do replacement",
            "verb omission", "used to", "past habits", "exception expressions",
            "argument structure", "wh questions", "numbers", "numerical reasoning",
            "schedule interpretation", "instruction following", "tense comparison", "grammar structures", "possessive forms"
        ]
    }
}

# Verify all concepts are mapped
all_concepts = set()
for q in data['questions']:
    for c in q.get('concepts', []):
        all_concepts.add(c)

unmapped = all_concepts - set(consolidation_map.keys())
if unmapped:
    print(f"WARNING: Unmapped concepts: {unmapped}")
else:
    print("All concepts are mapped!")

print(f"\nOriginal unique concepts: {len(all_concepts)}")
print(f"Mapped to: {len(set(consolidation_map.values()))} canonical concepts")

# Count questions per canonical concept
canonical_counts = {}
for q in data['questions']:
    for c in q.get('concepts', []):
        if c in consolidation_map:
            canon = consolidation_map[c]
            canonical_counts[canon] = canonical_counts.get(canon, 0) + 1

print("\nCanonical concept distribution:")
for canon in sorted(canonical_counts.keys()):
    print(f"  {canon}: {canonical_counts[canon]}")

# Save consolidation map
output = {
    "version": "1.0",
    "total_original": len(all_concepts),
    "categories": categories,
    "mapping": consolidation_map
}

with open('concept_consolidation_map.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\nSaved concept_consolidation_map.json")

# Create v2 exam questions
for q in data['questions']:
    if q.get('concepts'):
        new_concepts = []
        for c in q['concepts']:
            if c in consolidation_map:
                mapped = consolidation_map[c]
                if mapped not in new_concepts:
                    new_concepts.append(mapped)
        q['concepts'] = new_concepts

with open('exam-questions-v2.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved exam-questions-v2.json")

# Final stats
v2_concepts = set()
for q in data['questions']:
    for c in q.get('concepts', []):
        v2_concepts.add(c)

print(f"\n=== FINAL STATS ===")
print(f"Original unique concepts: {len(all_concepts)}")
print(f"Consolidated unique concepts: {len(v2_concepts)}")