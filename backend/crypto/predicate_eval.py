from datetime import datetime

class PredicateEvaluator:
    """
    Evaluates complex predicates against credential attributes.
    Supports Comparison, Range, Set, and Compound predicates.
    """
    
    @staticmethod
    def validate(predicate: dict) -> bool:
        """
        Validate the structure of a predicate object.
        Returns True if valid, raises ValueError if invalid.
        """
        if not isinstance(predicate, dict):
            raise ValueError("Predicate must be a dictionary")
            
        p_type = predicate.get("type", "").upper()
        if not p_type:
            raise ValueError("Predicate must have a 'type'")
            
        valid_types = {"AND", "OR", "NOT", "EQUAL", "NOT_EQUAL", "GREATER_THAN", 
                       "LESS_THAN", "GREATER_EQUAL", "LESS_EQUAL", "BETWEEN", "IN", "NOT_IN"}
                       
        if p_type not in valid_types:
            raise ValueError(f"Unknown predicate type: {p_type}")
            
        if p_type in ["AND", "OR"]:
            sub_preds = predicate.get("predicates")
            if not isinstance(sub_preds, list):
                raise ValueError(f"{p_type} requires 'predicates' list")
            for sub in sub_preds:
                PredicateEvaluator.validate(sub)
            return True
            
        if p_type == "NOT":
            sub = predicate.get("predicate")
            if not sub:
                raise ValueError("NOT requires 'predicate' object")
            PredicateEvaluator.validate(sub)
            return True
            
        # Leaf nodes
        if "attribute" not in predicate:
            raise ValueError(f"{p_type} requires 'attribute'")
            
        if p_type == "BETWEEN":
            if "min" not in predicate or "max" not in predicate:
                raise ValueError("BETWEEN requires 'min' and 'max'")
        elif p_type in ["IN", "NOT_IN"]:
            if "value" not in predicate or not isinstance(predicate["value"], list):
                raise ValueError(f"{p_type} requires 'value' list")
        else:
            if "value" not in predicate:
                raise ValueError(f"{p_type} requires 'value'")
                
        return True

    @staticmethod
    def evaluate(predicate: dict, attributes: dict) -> bool:
        """
        Evaluate a predicate object against attributes.
        """
        p_type = predicate.get("type", "").upper()
        
        if p_type == "AND":
            return all(PredicateEvaluator.evaluate(sub, attributes) for sub in predicate.get("predicates", []))
            
        if p_type == "OR":
            return any(PredicateEvaluator.evaluate(sub, attributes) for sub in predicate.get("predicates", []))
            
        if p_type == "NOT":
            return not PredicateEvaluator.evaluate(predicate.get("predicate", {}), attributes)
            
        # Leaf predicates
        attr_name = predicate.get("attribute")
        if not attr_name or attr_name not in attributes:
            return False # Attribute missing = fail
            
        value = attributes[attr_name]
        target = predicate.get("value")
        
        # Type conversion helpers
        # Assume attributes are strings, try to parse depending on target type
        
        try:
            val_typed, target_typed = PredicateEvaluator._coerce_types(value, target)
        except ValueError:
            return False

        if p_type == "EQUAL":
            return val_typed == target_typed
            
        if p_type == "NOT_EQUAL":
            return val_typed != target_typed
            
        if p_type == "GREATER_THAN":
            return val_typed > target_typed
            
        if p_type == "LESS_THAN":
            return val_typed < target_typed
            
        if p_type == "GREATER_EQUAL":
            return val_typed >= target_typed
            
        if p_type == "LESS_EQUAL":
            return val_typed <= target_typed
            
        if p_type == "BETWEEN":
            min_val = predicate.get("min")
            max_val = predicate.get("max")
            # Coerce min/max too
            _, min_typed = PredicateEvaluator._coerce_types(value, min_val)
            _, max_typed = PredicateEvaluator._coerce_types(value, max_val)
            return min_typed <= val_typed <= max_typed
            
        if p_type == "IN":
            # Target is a list
            return val_typed in target # Target should be list of same type
            
        if p_type == "NOT_IN":
            return val_typed not in target
            
        return False

    @staticmethod
    def _coerce_types(value_str, target_val):
        """
        Convert string attribute to type of target value for comparison.
        """
        if isinstance(target_val, int):
            return int(value_str), target_val
        if isinstance(target_val, float):
            return float(value_str), target_val
        if isinstance(target_val, bool):
            return (value_str.lower() == "true"), target_val
        # Date handling could be added here (ISO 8601 string comparison works lexicographically usually)
        return str(value_str), str(target_val)
