import os

def main():
    print("=" * 60)
    print("            AgentAI Hub Deployment & Push Helper")
    print("=" * 60)
    print()

    # 1. Ask for Render Backend URL
    print("Please enter your Render Backend URL.")
    print("Example: https://agent-ai-backend.onrender.com")
    render_url = input("Render URL: ").strip()

    if not render_url:
        print("[WARNING] No URL entered. Keeping the default placeholder in vercel.json.")
        backend_dest = "https://YOUR_RENDER_BACKEND_URL/api/$1"
    else:
        # Format the URL
        if not render_url.startswith("http"):
            render_url = "https://" + render_url
        render_url = render_url.rstrip("/")
        
        if "/api" in render_url:
            backend_dest = f"{render_url}/$1"
        else:
            backend_dest = f"{render_url}/api/$1"

    # 2. Write the frontend/vercel.json file
    vercel_json_path = os.path.join("frontend", "vercel.json")
    content = f"""{{
  "rewrites": [
    {{
      "source": "/api/(.*)",
      "destination": "{backend_dest}"
    }},
    {{
      "source": "/(.*)",
      "destination": "/index.html"
    }}
  ]
}}
"""
    try:
        with open(vercel_json_path, "w") as f:
            f.write(content)
        print(f"[SUCCESS] Updated {vercel_json_path} with backend: {backend_dest}")
    except Exception as e:
        print(f"[ERROR] Failed to write {vercel_json_path}: {e}")
        return

    # 3. Clean up redundant root files
    unneeded_files = ["vercel.json", "run_build.py", "test.txt"]
    for filename in unneeded_files:
        if os.path.exists(filename):
            try:
                os.remove(filename)
                print(f"[SUCCESS] Removed redundant root file: {filename}")
            except Exception as e:
                print(f"[WARNING] Could not delete {filename}: {e}. You can delete it manually.")

    # 4. Push to Git
    print("\n[INFO] Running git commands to push to GitHub...")
    os.system("git add .")
    os.system('git commit -m "Deploy: Configure frontend/vercel.json and clean up root vercel.json"')
    os.system("git push origin main")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Git push complete!")
    print("What to do next:")
    print("1. Go to your Vercel Project Dashboard.")
    print("2. Under Settings -> General, make sure 'Root Directory' is set to 'frontend'.")
    print("3. Redeploy the latest commit.")
    print("=" * 60)

if __name__ == "__main__":
    main()
