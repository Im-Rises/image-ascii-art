import React, {useRef, useEffect, useState, createRef} from 'react';
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

const defaultProps = {
	preTagRef: createRef<HTMLPreElement>(),
	flipY: false,
};

export const ImageAscii = (props: Props) => {
	// Merge the props with the default props
	const mergedProps = {...defaultProps, ...props};

	// Set the local variables
	const canvasVideoBufferRef = useRef<HTMLCanvasElement>(null);
	const [asciiText, setAsciiText] = useState('');

	// UseEffect to calculate the font size and set the resize observer (to resize the canvas and the font size, when the parent element is resized)
	useEffect(() => {
		calculateAndSetFontSize(mergedProps.preTagRef.current!, mergedProps.charsPerLine, mergedProps.charsPerColumn, mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight);

		// Set a resize observer to the parent element to resize the canvas and the font size
		const resizeObserver = new ResizeObserver(entries => {
			const {width, height} = entries[0].contentRect;
			calculateAndSetFontSize(mergedProps.preTagRef.current!, mergedProps.charsPerLine, mergedProps.charsPerColumn, width, height);
		});
		if (mergedProps.parentRef.current) {
			resizeObserver.observe(mergedProps.parentRef.current);
		}

		drawAsciiArt();

		// Stop the resize observer when the component is unmounted
		return () => {
			resizeObserver.disconnect();
		};
	}, [mergedProps.image, mergedProps.parentRef, mergedProps.charsPerLine, mergedProps.charsPerColumn, mergedProps.artType]);

	const drawAsciiArt = () => {
		const canvas = canvasVideoBufferRef.current!;
		const context = canvas.getContext('2d', {willReadFrequently: true})!;

		context.drawImage(mergedProps.image, 0, 0, canvas.width, canvas.height);
		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

		switch (mergedProps.artType) {
			case ArtTypeEnum.ASCII:
				setAsciiText(getAsciiFromImage(imageData, asciiChars));
				break;
			case ArtTypeEnum.ASCII_COLOR:
				setAsciiText(getAsciiFromImageColor(imageData, asciiChars));
				break;
			case ArtTypeEnum.ASCII_COLOR_BG_IMAGE:
				setAsciiText(getAsciiFromImage(imageData, asciiChars));
				// Set the background image of the pre tag to the resized canvas
				mergedProps.preTagRef.current!.style.backgroundImage = `url(${canvasImgToUrl(canvas).src})`;
				// // Set the background image of the pre tag to the original dimensions video
				// mergedmergedProps.preTagRef.current!.style.backgroundImage = `url(${videoImgToUrl(mergedProps.videoStreaming).src})`;
				break;
			default:
				break;
		}
	};

	return (
		<div style={{
			backgroundColor: mergedProps.backgroundColor,
			padding: 0, margin: 0, display: 'flex', justifyContent: 'center',
			alignItems: 'center', width: '100%', height: '100%',
		}}>
			<canvas ref={canvasVideoBufferRef} width={props.charsPerLine} height={props.charsPerColumn}
				style={{display: 'none'}}
			/>
			{
				(() => {
					switch (mergedProps.artType) {
						case ArtTypeEnum.ASCII:
							return (
								<pre ref={mergedProps.preTagRef} style={{
									backgroundColor: mergedProps.backgroundColor,
									color: mergedProps.fontColor,
									padding: 0,
									margin: 0,
									letterSpacing: `${lineSpacing}em`,
									lineHeight: `${lineHeight}em`,
									transform: `scaleX(${mergedProps.flipY ? -1 : 1})`,
									overflow: 'hidden',
								}}>
									{asciiText}
								</pre>
							);
						case ArtTypeEnum.ASCII_COLOR:
							return (
								<pre ref={mergedProps.preTagRef} dangerouslySetInnerHTML={{__html: asciiText}}
									style={{
										backgroundColor: mergedProps.backgroundColor,
										color: mergedProps.fontColor,
										padding: 0,
										margin: 0,
										letterSpacing: `${lineSpacing}em`,
										lineHeight: `${lineHeight}em`,
										transform: `scaleX(${mergedProps.flipY ? -1 : 1})`,
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
									<pre ref={mergedProps.preTagRef} style={{
										padding: 0,
										margin: 0,
										letterSpacing: `${lineSpacing}em`,
										lineHeight: `${lineHeight}em`,
										backgroundSize: '100% 100%',
										backgroundClip: 'text',
										WebkitBackgroundClip: 'text',
										color: 'transparent',
										transform: `scaleX(${mergedProps.flipY ? -1 : 1})`,
										overflow: 'hidden',
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
