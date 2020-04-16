const importer = async (
  client,
  question,
  answer,
  jtaID,
  title,
  notebook,
  tags
) => {
  const noteIDs = await client.findNote(jtaID);
  if (noteIDs.length > 1) {
    throw new Error(
      `Oops, expected at most one note with Joplin to Anki ID ${jtaID} but found multiple: \n${notes}`
    );
  }
  if (noteIDs.length === 1) {
    await client.updateNote(noteIDs[0], question, answer);
    return client.updateNoteTags(noteIDs[0], title, notebook, tags);
  }
  return client.createNote(question, answer, jtaID, title, notebook, tags);
};

module.exports = {
  importer,
};
