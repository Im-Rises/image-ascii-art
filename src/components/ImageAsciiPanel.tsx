import React, {useEffect, useRef, useState} from 'react';
import './ImageAsciiPanel.scss';
import ImageDemo from '../images/demoImage.png';
import {ImageAscii, ArtTypeEnum} from './ImageAscii';

const ImageAsciiPanel = () => {
	// Define the ascii art chars per line
	const charsPerLine = 100;
	const [charsPerColumn, setCharsPerColumn] = useState(0);
	const [imageSrc, setImageSrc] = useState('');
	const [isImageReady, setIsImageReady] = useState(false);

	const preTagRef = useRef<HTMLPreElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const parentRef = useRef<HTMLDivElement>(null);

	const calculateCharsPerColumn = (image: HTMLImageElement) => Math.round(charsPerLine * (image.height / image.width));

	// Handle the copy to clipboard button click
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log('Text copied to clipboard');
		} catch (err: unknown) {
			console.error('Failed to copy text: ', err);
		}
	};

	const handleImageChange = () => {
		if (inputRef.current?.files?.length) {
			const file = inputRef.current.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				if (reader.result !== '') {
					setImageSrc(reader.result as string);

					const img = new Image();
					img.src = reader.result as string;
					img.onload = () => {
						setCharsPerColumn(calculateCharsPerColumn(img));
						setIsImageReady(true);
					};
				}
			};

			reader.readAsDataURL(file);
		}
	};

	// Tags of the webcam and video ascii element
	// Show the webcam only when it is ready, otherwise show a loading message
	return (
		<>
			<div className={'Image-Ascii-Input'}>
				<input ref={inputRef} type='file' accept='image/*' onChange={handleImageChange}/>
			</div>
			<div ref={parentRef} className={'Image-Ascii-Panel'}>
				{
					isImageReady
						? (
							<ImageAscii imageSrc={imageSrc} parentRef={parentRef}
								artType={ArtTypeEnum.ASCII_COLOR_BG_IMAGE}
								charsPerLine={charsPerLine}
								charsPerColumn={charsPerColumn}
								fontColor={'white'}
								backgroundColor={'black'}
								preTagRef={preTagRef}
							/>
						)
						: (
							<p>No image</p>
						)
				}
				<button className={'Button-Copy-Clipboard'}
					onClick={async () => copyToClipboard(preTagRef.current!.innerText)}>Copy
				</button>
			</div>
		</>
	);
};

export default ImageAsciiPanel;
