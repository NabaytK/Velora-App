# main.py
import tkinter as tk
from tkinter import ttk, scrolledtext
import yfinance as yf
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt

class VeloraTradingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Velora Stock Trading")
        self.root.geometry("1200x800")
        
        # Create tabs
        self.notebook = ttk.Notebook(root)
        self.setup_dashboard_tab()
        self.setup_trading_tab()
        self.setup_chatbot_tab()
        self.notebook.pack(expand=True, fill="both")

    def setup_dashboard_tab(self):
        # Dashboard UI (to be implemented)
        pass

    def setup_trading_tab(self):
        # Trading UI (to be implemented)
        pass

    def setup_chatbot_tab(self):
        # Chatbot UI
        self.chat_frame = ttk.Frame(self.notebook)
        self.chat_history = scrolledtext.ScrolledText(self.chat_frame)
        self.chat_input = ttk.Entry(self.chat_frame)
        self.send_btn = ttk.Button(self.chat_frame, text="Ask", command=self.handle_chat)
        
        self.chat_history.pack(padx=10, pady=10, fill="both", expand=True)
        self.chat_input.pack(padx=10, pady=5, fill="x")
        self.send_btn.pack(padx=10, pady=5)
        self.notebook.add(self.chat_frame, text="AI Assistant")

    def handle_chat(self):
        user_input = self.chat_input.get()
        response = "This is a placeholder response"
        self.chat_history.insert(tk.END, f"\nYou: {user_input}\nVelora: {response}\n")
        self.chat_input.delete(0, tk.END)

if __name__ == "__main__":
    root = tk.Tk()
    app = VeloraTradingApp(root)
    root.mainloop()
