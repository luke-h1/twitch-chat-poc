const getUsersByBeginText = (
  beginText: string,
  users: string[],
  meLogin: string | null,
  limit = 5
) => {
  const result = [];
  const beginTextLower = beginText.toLowerCase();

  for (const name of users) {
    if (result.length === limit) return result;

    const nameLower = name.toLowerCase();

    if (
      (beginTextLower === "" || nameLower.startsWith(beginTextLower)) &&
      nameLower !== meLogin
    ) {
      result.push(name);
    }
  }

  return result;
};

export default getUsersByBeginText;
