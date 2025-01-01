NEW_MESSAGE="feat(frontend): redux impl"

# Start interactive rebase from the root commit
git rebase -i --root

# Replace commit messages
GIT_EDITOR="sed -i 's/^pick/reword/; s/^#.*//'" git rebase --continue

# Rebase will stop for each commit, allowing you to change the message
while [ $? -eq 0 ]; do
  git commit --amend -m "$NEW_MESSAGE"
  git rebase --continue
done
