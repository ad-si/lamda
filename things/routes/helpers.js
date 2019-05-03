function getMainYamlFile (files) {
  return files.includes('index.yaml')
    ? 'index.yaml'
    : files.includes('main.yaml')
      ? 'main.yaml'
      : files.includes('data.yaml')
        ? 'data.yaml'
        : null
}

module.exports = {
  getMainYamlFile
}
