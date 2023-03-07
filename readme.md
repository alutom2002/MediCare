# Medicare Management Clinic System

This is a App to Manage appointments, bills, drugs, human resources in a hospital. <br>

## Clone My Repo <br>

```
git clone https://github.com/alutom2002/Medicare
```

After Cloning, Go to the directory by typing the command shown below.

```
cd MediCare
```

Then install package 

```
npm install
```

Then create `.env` file on root directory

```
cp .env.example .env
```

Run app

```
npm run dev
```

This app have 3 sections. <br>

```
1. User Panel
2. Doctor Panel
3. Admin Panel
4. Pharmacist Panel
5. Reception page
```

To access the doctor, pharmacist, receptionist and admin pages you will need to reconfigure your local network

On Linux and OSX , add your subdomain to 

```
/etc/hosts
```

```
127.0.0.1 myapp.dev
127.0.0.1 doctor.care.myapp.local
127.0.0.1 admin.care.myapp.local
127.0.0.1 pharmacist.care.myapp.local
127.0.0.1 receptionist.care.myapp.local
```

You may not have write permissions on your hosts file, in which case you can grant them:

### Linux

```
sudo chmod a+rw /etc/hosts
```

### Windows

On Windows 7 and 8, the hosts file path is

```
%systemroot%\system32\drivers\etc.
```

After setting sudomains got to

```
doctor.care.myapp.local:3001
pharmacist.care.myapp.local:3001
receptionist.care.myapp.local:3001
admin.care.myapp.local:3001
```

for enter each panel.
When done the above steps download mongodb compass and setup at

```
https://www.mongodb.com/try/download/compass
```

Add database by collections of .json . files
To access the admin page 
`(current database have none so much add data before login)`

```
username: admin
password: password
```

Other users default password is password

### Thanks for reading :heart:
### Have a nice day :heart: