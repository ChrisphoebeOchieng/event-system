from app import create_app

app = create_app()

print("=" * 60)
print("EVENT SYSTEM STARTED")
print(app.url_map)
print("=" * 60)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
