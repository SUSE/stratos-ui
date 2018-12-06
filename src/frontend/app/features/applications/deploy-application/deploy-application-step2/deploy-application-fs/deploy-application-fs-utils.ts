import { DeployApplicationFSScanner, FileScannerInfo } from './deploy-application-fs-scanner';
import { Observable ,  BehaviorSubject } from 'rxjs';

export const CF_IGNORE_FILE = '.cfignore';
export const CF_DEFAULT_IGNORES = '.cfignore\n_darcs\n.DS_Store\n.git\n.gitignore\n.hg\n.svn\n';
export const CF_MANIFEST_FILE = 'manifest.yml';

export class DeployApplicatioNFsUtils {

  constructor() { }

  // File list from a file input form field
  handleFileInputSelection(items): Observable<FileScannerInfo> {
    const obs$ = new BehaviorSubject<DeployApplicationFSScanner>(undefined);
    let scanner = new DeployApplicationFSScanner(CF_DEFAULT_IGNORES);
    let cfIgnoreFile;
    let manifestFile = false;
    let rootFolderName = '';

    if (items.length === 1) {
      if (scanner.isArchiveFile(items[0].name)) {
        scanner.addFile(items[0]);
        scanner.summarize();
        obs$.next(scanner);
      }
    } else {
      // See if we can find the .cfignore file and/or the manifest file
      for (let j = 0; j < items.length; j++) {
        const filePath = items[j].webkitRelativePath.split('/');
        // First part is the root folder name
        if (filePath.length === 2 && !rootFolderName) {
          rootFolderName = filePath[0];
        }
        if (filePath.length > 2) {
          // Don't traverse below the 1st level of files (could take a while)
          break;
        }
        if (!cfIgnoreFile && filePath.length === 2 && filePath[1] === CF_IGNORE_FILE) {
          cfIgnoreFile = items[j];
        }
        if (filePath.length === 2 && filePath[1] === CF_MANIFEST_FILE) {
          manifestFile = items[j];
        }
      }
    }

    // If we found the Cloud Foundry ignore file, read the ignores file
    let readIgnoresFile = Promise.resolve('');
    if (cfIgnoreFile) {
      readIgnoresFile = scanner.readFileContents(cfIgnoreFile);
    }

    readIgnoresFile.then((ignores) => {
      scanner = new DeployApplicationFSScanner(CF_DEFAULT_IGNORES + ignores, rootFolderName);
      scanner.cfIgnoreFile = cfIgnoreFile;
      scanner.manifestFile = manifestFile;
      for (let index = 0; index < items.length; index++) {
        scanner.addFile(items.item(index));
      }
      scanner.summarize();
      obs$.next(scanner);
    });

    return obs$;
  }

}
