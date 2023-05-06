import React, {useRef, useEffect, useState} from 'react';
import {asciiChars} from '../constants/pixel-ascii';
import {
	calculateAndSetFontSize, canvasImgToUrl,
	getAsciiFromImage,
	getAsciiFromImageColor, lineHeight,
	lineSpacing,
} from '../canvas-handler/image-canvas-ascii';

export enum ArtTypeEnum {
	ASCII = 'ASCII',
	ASCII_COLOR = 'ASCII_COLOR',
	ASCII_COLOR_BG_IMAGE = 'ASCII_COLOR_BG_IMAGE',
}

type Props = {
	image: HTMLImageElement;
	parentRef: React.RefObject<HTMLElement>;
	charsPerLine: number;
	charsPerColumn: number;
	fontColor: string;
	backgroundColor: string;
	artType: ArtTypeEnum;
	preTagRef?: React.RefObject<HTMLPreElement>;
	flipY?: boolean;
};

export const ImageAscii = (props: Props) => {
	const canvasVideoBufferRef = useRef<HTMLCanvasElement>(null);
	const preTagRef = props.preTagRef ?? useRef<HTMLPreElement>(null);
	// const imageRef = useRef<HTMLImageElement>(null);
	const flipY = props.flipY ?? false;

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
	}, [props.image, props.parentRef, props.charsPerLine, props.charsPerColumn, props.artType]);

	const drawAsciiArt = () => {
		const canvas = canvasVideoBufferRef.current!;
		const context = canvas.getContext('2d', {willReadFrequently: true})!;

		context.drawImage(props.image, 0, 0, canvas.width, canvas.height);
		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

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
				// preTagRef.current!.style.backgroundImage = `url(${props.imageSrc})`;
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
			{/* <img src={props.imageSrc} ref={imageRef} alt='image' onLoad={drawAsciiArt} style={{display: 'none'}}/> */}
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
									lineHeight: `${lineHeight}em`,
									transform: `scaleX(${flipY ? -1 : 1})`,
									overflow: 'hidden',
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
										lineHeight: `${lineHeight}em`,
										transform: `scaleX(${flipY ? -1 : 1})`,
										overflow: 'hidden',
									}}
								></pre>
							);
						case ArtTypeEnum.ASCII_COLOR_BG_IMAGE:
							return (
								<span>
									{
										/*
                                        This span is important for the browser, it helps differentiate
                                        the other pre tag from the one with the background image when
                                        toggling the artType. If the pre tag is not present, the browser
                                        might think that the change of pre tag is an update not a replace
                                         */
									}
									<pre ref={preTagRef} style={{
										padding: 0,
										margin: 0,
										letterSpacing: `${lineSpacing}em`,
										lineHeight: `${lineHeight}em`,
										backgroundSize: '100% 100%',
										backgroundClip: 'text',
										WebkitBackgroundClip: 'text',
										color: 'transparent',
										transform: `scaleX(${flipY ? -1 : 1})`,
										overflow: 'hidden',
										// backgroundImage: `url(${props.videoStreaming.src})`,
									}}>
										{asciiText}
									</pre>
								</span>
							);
						default:
							return (<p>ERROR</p>);
					}
				})()
			}
		</div>
	);
};
