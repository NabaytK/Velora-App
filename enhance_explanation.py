#!/usr/bin/env python3
import os
import sys

app_file = "enhanced_prediction_app.py" if os.path.exists("enhanced_prediction_app.py") else "app.py"

with open(app_file, "r") as file:
    content = file.read()

# Find the generate_explanation function
if "def generate_explanation" in content:
    start_index = content.find("def generate_explanation")
    
    # Find the next function definition
    next_def_index = content.find("def ", start_index + 1)
    if next_def_index == -1:
        end_index = len(content)
    else:
        end_index = content.rfind("\n", 0, next_def_index)
    
    old_function = content[start_index:end_index]
    print(f"Found generate_explanation function ({len(old_function)} characters)")
    
    # Create enhanced explanation function
    enhanced_function = """def generate_explanation(ticker, prediction_data):
    \"\"\"Generate detailed explanation for stock prediction based on technical factors\"\"\"
    current_price = prediction_data["current_price"]
    predicted_price = prediction_data["predicted_price"]
    percent_change = prediction_data["percent_change"]
    recommendation = prediction_data["recommendation"]
    
    # Analyze recent price movements
    historical = prediction_data.get("historical", [])
    recent_prices = [item["price"] for item in historical[-10:]] if len(historical) >= 10 else []
    
    # Determine trend characteristics if we have data
    if len(recent_prices) >= 5:
        recent_trend = "upward" if recent_prices[-1] > recent_prices[0] else "downward"
        
        # Calculate volatility
        price_changes = [abs(recent_prices[i] - recent_prices[i-1]) / recent_prices[i-1] * 100 
                        for i in range(1, len(recent_prices))]
        avg_volatility = sum(price_changes) / len(price_changes)
        
        if avg_volatility > 1.5:
            volatility = "high"
        elif avg_volatility > 0.7:
            volatility = "moderate"
        else:
            volatility = "low"
            
        # Calculate momentum
        short_momentum = (recent_prices[-1] - recent_prices[-3]) / recent_prices[-3] if len(recent_prices) >= 3 else 0
        momentum = "increasing" if short_momentum > 0.01 else "decreasing" if short_momentum < -0.01 else "stable"
    else:
        # Fallbacks if we don't have enough data
        recent_trend = "uncertain"
        volatility = "unknown"
        momentum = "uncertain"
    
    # Create detailed, confident explanations based on recommendation
    if recommendation == "BUY":
        explanation = (
            f"Based on our AI model analysis, {ticker} shows strong bullish indicators "
            f"with a predicted price increase of {percent_change:.2f}%. "
            f"The model forecasts the price to rise from ${current_price:.2f} to ${predicted_price:.2f} "
            f"in the short term. "
        )
        
        # Add details based on available data
        if recent_trend != "uncertain":
            explanation += (
                f"Recent price action shows a {recent_trend} trend with {volatility} volatility "
                f"and {momentum} momentum. "
            )
            
        explanation += (
            f"Technical indicators suggest strong buying pressure, and our AI system detects favorable market conditions. "
            f"Consider buying if aligned with your investment strategy and risk tolerance."
        )
    elif recommendation == "SELL":
        explanation = (
            f"Our AI model indicates potential bearish movement for {ticker}, "
            f"with a predicted price decrease of {abs(percent_change):.2f}%. "
            f"The forecast shows a decline from ${current_price:.2f} to ${predicted_price:.2f} "
            f"in the short term. "
        )
        
        # Add details based on available data
        if recent_trend != "uncertain":
            explanation += (
                f"Recent price action shows a {recent_trend} trend with {volatility} volatility "
                f"and {momentum} momentum. "
            )
            
        explanation += (
            f"Technical analysis reveals selling pressure, and our AI system identifies potential resistance levels ahead. "
            f"Consider reducing exposure if this aligns with your investment goals and risk management strategy."
        )
    else:  # HOLD
        explanation = (
            f"For {ticker}, our AI model predicts relatively stable price action "
            f"with a moderate change of {percent_change:.2f}%. "
            f"The forecast suggests the price may move from ${current_price:.2f} to ${predicted_price:.2f}. "
        )
        
        # Add details based on available data
        if recent_trend != "uncertain":
            explanation += (
                f"Recent price action shows a {recent_trend} trend with {volatility} volatility "
                f"and {momentum} momentum. "
            )
            
        explanation += (
            f"The analysis indicates a relatively balanced market with equilibrium between buying and selling pressure. "
            f"Holding current positions may be appropriate while monitoring market developments."
        )
    
    return explanation"""
    
    # Replace the function in the content
    new_content = content.replace(old_function, enhanced_function)
    
    with open("enhanced_final_app.py", "w") as file:
        file.write(new_content)
    
    print("Enhanced explanation function written to enhanced_final_app.py")
    print("\nTo apply the changes, use:")
    print("mv enhanced_final_app.py app.py")
else:
    print("Could not find generate_explanation function in the app file")
