# One Time Link

## Description

Simple project to:

- share a message with someone, via link, and delete the content once viewed.
- create KeePass from copy paste

## Key features

### One Time Link

- AES256 data encryption
- Password data encryption, to protect data from the service provider or a leak
  - Password is autogenerated, and added to the share-link. That's why you don't see it.

### Keepass generator

- Create a keepass directly from a copy/paste from your Excel file. A CSVToKeepass app in 2 click.

## Usage

### Native installation

```
git clone git@github.com:vincent-ledu/one-time-link.git
cd one-time-link
```

Adapt example.env, rename it to .env

```
npm install
npm run build
npm run start:production
```

### Docker

```
docker run vincentledu/one-time-link
```
