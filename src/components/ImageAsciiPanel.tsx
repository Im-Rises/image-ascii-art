import React, {useEffect, useRef, useState} from 'react';
import './ImageAsciiPanel.scss';
import ImageDemo from '../images/demoImage.png';
import {ImageAscii, ArtTypeEnum} from './ImageAscii';

const ImageAsciiPanel = () => {
	// Define the ascii art chars per line
	const charsPerLine = 100;
	const charsPerColumn = 100;
	const preTagRef = useRef<HTMLPreElement>(null);

	const [isImageInputted, setIsImageInputted] = useState(true);

	// Define the refs
	const parentRef = useRef<HTMLDivElement>(null);

	// Handle the copy to clipboard button click
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log('Text copied to clipboard');
		} catch (err: unknown) {
			console.error('Failed to copy text: ', err);
		}
	};

	// Tags of the webcam and video ascii element
	// Show the webcam only when it is ready, otherwise show a loading message
	return (
		<div className={'Image-Ascii-Panel'} data-testid='image-ascii-test' ref={parentRef}>
			<div>
				<button className={'Button-Copy-Clipboard'}
					onClick={async () => copyToClipboard(preTagRef.current!.innerText)}>Copy
				</button>
			</div>
			<div>
				<ImageAscii
					imageSrc={ImageDemo}
					parentRef={parentRef}
					artType={ArtTypeEnum.ASCII}
					charsPerLine={charsPerLine}
					charsPerColumn={charsPerColumn}
					fontColor={'white'}
					backgroundColor={'black'}
					preTagRef={preTagRef}
				/>
			</div>
		</div>
	);
};

export default ImageAsciiPanel;
