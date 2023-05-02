import React, {useRef, useEffect, useState} from 'react';
import {asciiChars} from '../constants/pixel-ascii';
import {
	calculateAndSetFontSize, canvasImgToUrl,
	getAsciiFromImage,
	getAsciiFromImageColor,
	lineSpacing,
} from '../canvas-handler/image-canvas-ascii';

export enum ArtTypeEnum {
	ASCII = 'ASCII',
	ASCII_COLOR = 'ASCII_COLOR',
	ASCII_COLOR_BG_IMAGE = 'ASCII_COLOR_BG_IMAGE',
}

type Props = {
	imageSrc: string;
	parentRef: React.RefObject<HTMLElement>;
	charsPerLine: number;
	charsPerColumn: number;
	fontColor: string;
	backgroundColor: string;
	artType: ArtTypeEnum;
	preTagRef?: React.RefObject<HTMLPreElement>;
};

export const ImageAscii = (props: Props) => {
	const canvasVideoBufferRef = useRef<HTMLCanvasElement>(null);
	const preTagRef = props.preTagRef ?? useRef<HTMLPreElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	const [asciiText, setAsciiText] = useState('');

	// UseEffect to calculate the font size and set the resize observer (to resize the canvas and the font size, when the parent element is resized)
	useEffect(() => {
		calculateAndSetFontSize(preTagRef.current!, props.charsPerLine, props.charsPerColumn, props.parentRef.current!.clientWidth, props.parentRef.current!.clientHeight);

		// Set a resize observer to the parent element to resize the canvas and the font size
		const resizeObserver = new ResizeObserver(entries => {
			const {width, height} = entries[0].contentRect;
			calculateAndSetFontSize(preTagRef.current!, props.charsPerLine, props.charsPerColumn, width, height);
		});
		if (props.parentRef.current) {
			resizeObserver.observe(props.parentRef.current);
		}

		drawAsciiArt();

		// Stop the resize observer when the component is unmounted
		return () => {
			resizeObserver.disconnect();
		};
	}, [props.imageSrc, props.parentRef, props.charsPerLine, props.charsPerColumn, props.artType]);

	const drawAsciiArt = () => {
		const canvas = canvasVideoBufferRef.current!;
		const context = canvas.getContext('2d', {willReadFrequently: true})!;

		context.drawImage(imageRef.current!, 0, 0, canvas.width, canvas.height);
		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		console.log(imageData);

		switch (props.artType) {
			case ArtTypeEnum.ASCII:
				setAsciiText(getAsciiFromImage(imageData, asciiChars));
				break;
			case ArtTypeEnum.ASCII_COLOR:
				setAsciiText(getAsciiFromImageColor(imageData, asciiChars));
				break;
			case ArtTypeEnum.ASCII_COLOR_BG_IMAGE:
				setAsciiText(getAsciiFromImage(imageData, asciiChars));
				preTagRef.current!.style.backgroundImage = `url(${canvasImgToUrl(canvas).src})`;
				// preTagRef.current!.style.backgroundImage = `url(${videoImgToUrl(props.videoStreaming).src})`;
				break;
			default:
				break;
		}
	};

	return (
		<div style={{
			backgroundColor: props.backgroundColor,
			padding: 0, margin: 0, display: 'flex', justifyContent: 'center',
			alignItems: 'center', width: '100%', height: '100%',
		}}>
			<img src={props.imageSrc} ref={imageRef} alt='image' onLoad={drawAsciiArt} style={{display: 'none'}}/>
			<canvas ref={canvasVideoBufferRef} width={props.charsPerLine} height={props.charsPerColumn}
				style={{display: 'none'}}
			/>
			{
				(() => {
					switch (props.artType) {
						case ArtTypeEnum.ASCII:
							return (
								<pre ref={preTagRef} style={{
									backgroundColor: props.backgroundColor,
									color: props.fontColor,
									padding: 0,
									margin: 0,
									letterSpacing: `${lineSpacing}em`,
								}}>
									{asciiText}
								</pre>
							);
						case ArtTypeEnum.ASCII_COLOR:
							return (
								<pre ref={preTagRef} dangerouslySetInnerHTML={{__html: asciiText}}
									style={{
										backgroundColor: props.backgroundColor,
										color: props.fontColor,
										padding: 0,
										margin: 0,
										letterSpacing: `${lineSpacing}em`,
									}}
								></pre>
							);
						case ArtTypeEnum.ASCII_COLOR_BG_IMAGE:
							return (
								<pre ref={preTagRef} style={{
									padding: 0,
									margin: 0,
									letterSpacing: `${lineSpacing}em`,
									backgroundSize: 'cover',
									backgroundClip: 'text',
									WebkitBackgroundClip: 'text',
									color: 'transparent',
									// backgroundImage: `url(${props.videoStreaming.src})`,
								}}>
									{asciiText}
								</pre>
							);
						default:
							return (<p>ERROR</p>);
					}
				})()
			}
		</div>
	);
};
