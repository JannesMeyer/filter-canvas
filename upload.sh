#/usr/bin/env sh

# http://www.damian.oquanta.info/posts/one-line-deployment-of-your-site-to-gh-pages.html
# git checkout -b gh-pages
# git rm -rf .
# git commit -m "Initial gh-pages commit"
# git push origin gh-pages
# git push origin $(git subtree split --prefix build gh-pages):gh-pages --force

# Recompile and upload
npm run prepublish &&
git reset &&
git add --force build &&
git commit -m "Recompile $(date +'%d %b %H:%M')" &&
git subtree push --prefix build origin gh-pages