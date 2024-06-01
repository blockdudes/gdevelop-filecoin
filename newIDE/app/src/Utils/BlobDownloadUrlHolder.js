// @flow
import * as React from 'react';
import { Web3ProviderContext } from '../Context/Store';
import { configure, fs } from '@zenfs/core';
import { Zip } from '@zenfs/zip';
import {
  publishGame,
  uploadImageToIPFS,
} from '../helperFunctions/gameHelperFunctions';
import { ethers } from 'ethers';

type Props = {
  blob: ?Blob,
  children: (blobDownloadUrl: string) => React.Node,
};

export const BlobDownloadUrlHolder = ({ blob, children }: Props) => {
  const [blobDownloadUrl, setBlobDownloadUrl] = React.useState('');
  const [currentBlob, setCurrentBlob] = React.useState<?Blob>(null);

  const {
    contractInstance,
    signer,
    getContractInstance,
    gameData,
    setIsGamePublished,
    setGameData,
  } = React.useContext(Web3ProviderContext);

  function blobToFileList(blob: Blob, fileName): FileList {
    const dataTransfer = new DataTransfer(); // Create a new DataTransfer instance
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: new Date().getTime(), // Use the current timestamp as the last modified time
    });

    dataTransfer.items.add(file); // Add the File object to the DataTransfer object
    return dataTransfer.files; // Return the FileList from the DataTransfer object
  }

  React.useEffect(
    () => {
      // This effect function does not look at the blobDownloadUrl, to avoid infinite loops.
      // It is only in charge of updating the Url when the blob changes.
      if (blob && blob !== currentBlob) {
        setBlobDownloadUrl(URL.createObjectURL(blob));
        setCurrentBlob(blob);
      }
    },
    [blob, currentBlob]
  );

  React.useEffect(
    () => {
      const publishTofileCoin = async (): FileList => {
        setIsGamePublished(true);
        try {
          if (!blob) return;
          await configure({
            mounts: {
              '/': { backend: Zip, data: await blob.arrayBuffer() },
            },
          });
          const imageBlob = await fs.openAsBlob('/thumbnail.png', {
            type: 'image/png',
          });

          const imageUrl = await uploadImageToIPFS(
            blobToFileList(imageBlob).item(0),
            signer
          );

          const res = await publishGame(
            getContractInstance(),
            blobToFileList(blob, 'game.zip'),
            signer,
            gameData?.name,
            'ING',
            ethers.utils.parseEther(gameData?.price),
            imageUrl
          );

          setIsGamePublished(false);
          setGameData(null);
        } catch (error) {
          console.log('error', error);
          setIsGamePublished(false);
          setGameData(null);
        }
      };

      setTimeout(() => {
        publishTofileCoin();
      }, 500);
    },
    [contractInstance]
  );

  React.useEffect(
    () => {
      // This cleanup is called both when the component is unmounted or when an update happens.
      // This allows releasing the URL when a new one is generated.
      // See https://reactjs.org/docs/hooks-effect.html#explanation-why-effects-run-on-each-update
      return () => {
        if (blobDownloadUrl) {
          URL.revokeObjectURL(blobDownloadUrl);
        }
      };
    },
    [blobDownloadUrl]
  );

  return children(blobDownloadUrl);
};

/**
 * Open an URL generated from a blob, to download it with the specified filename.
 */
export const openBlobDownloadUrl = (url: string, filename: string) => {
  const { body } = document;
  if (!body) return;

  // Not using Window.openExternalURL because blob urls are blocked
  // by Adblock Plus (and maybe other ad blockers).
  const a = document.createElement('a');
  body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  a.click();
  body.removeChild(a);
};
