.ENV
PORT=80
JWT_SECRET=my-secret-key 
CONNECTION_STRING=mongodb+srv://wowradiol:wowradio001@wowradio.wp5w5ir.mongodb.net/?retryWrites=true&w=majority&appName=wowradiox
EMAIL_USER=esteticaagencys@gmail.com
EMAIL_PASS=fnov wvvb jjml ypta
CLOUDINARY_CLOUD_NAME=drfsrg16r
CLOUDINARY_API_KEY=998991759422945
CLOUDINARY_API_SECRET=RYRcC6aWstO-YdRMQaEm-_yK2eI



EC2 COMMAND FOR GIT 
On my ec2 When I make changes on my github repo and I want to pull changes without stoping the server how do I do that. 
ChatGPT said:

To pull changes from your GitHub repo to your EC2 server without stopping your Node.js/Express server running via PM2, follow this professional workflow:

✅ 1. Navigate to your project directory

On your EC2 instance:

cd /home/ec2-user/your-project-folder

✅ 2. Pull the latest changes from GitHub
git pull origin main


Replace main with your branch name if it's different.

⚠️ If the branch has protected changes or submodules, consider using:

git stash       # Save local uncommitted changes (if any)
git pull origin main
git stash pop   # Reapply local changes

✅ 3. Install any new dependencies
npm install


Only necessary if you've updated package.json.

✅ 4. Restart app with PM2 gracefully

Now instead of stopping the server, just reload it:

pm2 reload ecosystem.config.js


This:

Pulls latest code

Keeps app alive during the reload (zero-downtime)

Reloads with the latest code changes and envs

✅ Optional: Automatically Pull on Every Push

You can use a GitHub Webhook + simple bash script to automatically pull and reload PM2 when you push to GitHub.

Let me know if you want to set that up too.