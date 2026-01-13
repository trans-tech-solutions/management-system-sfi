function Versions(): React.JSX.Element {
  const electronApi = (window as unknown as { electron?: { process?: { versions?: NodeJS.ProcessVersions } } }).electron
  const versions = electronApi?.process?.versions ?? process.versions

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
