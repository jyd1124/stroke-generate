/**
 * @author itorr<https://github.com/itorr>
 * @date 2022-06-01
 * @Description One Last Image
 * */



const randRange = (a, b) => Math.floor(Math.random() * (b - a) + a);

const inputImageEl = document.querySelector('#input');



let width = 640;
let height = 480;
let scale = width / height;



let lastConfigString = null;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// 在开启 config.shade 时，代码会先根据主画布的灰度值，生成一张单独的灰度遮罩（shadePixel），再把它绘制到 canvasShade 上
const canvasShade = document.createElement('canvas');
// canvasShadeMin 会用更小的尺寸（_width / shadeZoom、_height / shadeZoom）去将 canvasShade 的内容缩放下采样，然后再缩放回主尺寸，以制造一种“颗粒化”的下采样效果。这种做法可以让阴影带有更天然、粗糙的颗粒感
const canvasShadeMin = document.createElement('canvas');
// 这个画布用于整体内容的“缩小再放大”处理。
// 	•	在一系列空间滤波（卷积）、绘制和叠加完成后，代码会把处理后的主画布内容先缩小到 canvasMin（宽度为 _width/1.4、高度为 _height/1.3），然后再把 canvasMin 的结果放回给主画布（canvas）。
// 	•	这样做能让图像看起来略微柔和、带有手绘水印般的自然“模糊”效果，类似在画面整体上进一步进行一次轻度下采样与上采样
const canvasMin = document.createElement('canvas');
// 此画布专门用来加载并缓存铅笔颗粒纹理（pencilTextureEl）。
// 	•	在 config.shade 分支里，会把这张预加载的 pencilTextureEl（一张铅笔颗粒图）拉伸到与主图同样的尺寸，然后通过 pencilTextureCtx.getImageData(…) 拿到它对应的像素数据（pencilTexturePixel）。
// 	•	后续用 pencilTexturePixel.data[i] 读取每个像素的亮度值，在生成暗部阴影时，就能根据这张纹理去调节最终的阴影叠加强度，从而让阴影看起来更像是“铅笔划痕”或“颗粒感”而不是纯粹的平面阴影
const pencilTextureCanvas = document.createElement('canvas');

// 核心的图像处理函数。
// 它接收一个图像、一个输出 Canvas、配置对象和回调函数
// 然后根据配置对图像进行一系列处理，并将结果绘制到输出 Canvas 上

// img: HTMLImageElement 对象，即输入的图像。
// outputCanvas: HTMLCanvasElement 对象，用于绘制最终处理结果的画布。
// config: 一个包含各种处理选项的对象，例如：
	// zoom: 缩放比例。
	// cover: 是否裁剪图像以适应1:1比例。
	// shade: 是否应用阴影效果。
	// shadeLimit: 阴影阈值。
	// shadeLight: 阴影亮度。
	// light: 亮度调整值。
	// denoise: 是否进行降噪处理。
	// Convolutes: 包含预定义卷积核的对象。
	// convoluteName: 当前选择的卷积核名称。
	// convolute1Diff: 是否与第二个卷积核进行差异比较。
	// convoluteName2: 第二个卷积核的名称。
	// lightCut: 亮部裁切值。
	// darkCut: 暗部裁切值。
	// kuma: 是否应用 "kuma" (渐变叠加) 效果。
	// watermark: 是否添加水印。
	// hajimei: 水印类型 (影响水印图片的裁剪位置)。
	// callback: (代码中未使用) 一个回调函数，可能用于处理完成后的通知。
const louvre = async ({img, outputCanvas, config, callback}) => {
	if (!img || !config) return;

	const configString = [
		JSON.stringify(config),
		img.src,
	].join('-');

	if (lastConfigString === configString) return;

	console.time('louvre');

	lastConfigString = configString;

	// 尺寸计算
	const oriWidth = img.naturalWidth;
	const oriHeight = img.naturalHeight;

	let oriScale = oriWidth / oriHeight;



	// const _width  = Math.floor( width  / config.zoom );
	// const _height = Math.floor( height / config.zoom );
	let _width  = Math.round( oriWidth   / config.zoom );
	let _height = Math.round( oriHeight  / config.zoom );

	const maxWidth = 1920;
	if(_width > maxWidth){
		_height = _height * maxWidth / _width
		_width = maxWidth
	}
	// const _width = 800;
	// const _height = 800;


	let cutLeft = 0;
	let cutTop = 0;

	let calcWidth = oriWidth;
	let calcHeight = oriHeight;

	if(config.cover){

		if(oriScale > 1){
			cutLeft = (oriScale - 1) * oriHeight / 2;
			cutLeft = Math.round(cutLeft);
			calcWidth = oriHeight;
			_width = _height;
		}else{
			cutTop =  (1 - oriScale) * oriHeight / 2;
			cutTop = Math.round(cutTop);
			calcHeight = oriWidth;
			_height = _width;
		}
	}


	let setLeft = 0;
	let setTop = 0;

	let setWidth = _width;
	let setHeight = _height;


	canvas.width = _width;
	canvas.height = _height;


	// 图像绘制
	ctx.drawImage(
		img,
		cutLeft, cutTop,
		calcWidth, calcHeight,

		setLeft, setTop,
		setWidth, setHeight
	);
	// ctx.font = '200px sans-serif'
	// ctx.fillText('123233',50,200);

	let pixel = ctx.getImageData(0, 0, _width, _height);



	let pixelData = pixel.data;

	// 测试图像数据读取正常与否
	// alert(pixel.data.slice(0,10);

	// pixelData 是一个扁平的 Uint8ClampedArray
	// 按 [R, G, B, A, R, G, B, A, …] 排列
	// R、G、B、Alpha（透明度）值[0-255]
	for (let i = 0; i < pixelData.length; i += 4) {
		// let yuv = rgb2yuv(
		// 	pixelData[i],
		// 	pixelData[i + 1],
		// 	pixelData[i + 2],
		// );
		const r = pixelData[i];
		const g = pixelData[i + 1];
		const b = pixelData[i + 2];
		// 计算亮度分量 Y
		// 使用经典的 BT.601 灰度转换系数
		let y = r * .299000 + g * .587000 + b * .114000;
		y = Math.floor(y);

		// if(i%10000) console.log(y);

		pixelData[i    ] = y;
		pixelData[i + 1] = y;
		pixelData[i + 2] = y;
	}
	let shadePixel;

	// shadeLimit 亮度阈值
	// shadeLight 阴影亮度控制
	const { 
		shadeLimit = 80,
		shadeLight = 40 
	} = config;
	let pencilTexturePixel;
	if(config.shade){

		// 载入纹理
		// 将预加载的 pencilTextureEl（一张铅笔颗粒纹理图）拉伸到与输入图同样尺寸；
		// 然后通过 getImageData 拿到它的 RGBA 数据，后面会用作“颗粒”细节的掩模
		pencilTextureCanvas.width = _width;
		pencilTextureCanvas.height = _height;
		// pencilTextureCanvas 是在前面通过 document.createElement('canvas') 创建的一个画布元素，但还没有任何绘制能力
		// 调用 .getContext('2d') 就相当于打开了这块画布的“画笔”，让后续代码可以使用 pencilTextureCtx 来做各种绘图操作
			// - drawImage(...) 将纹理图拉伸或裁剪到画布上
			// - fillRect()、stroke() 等绘制矩形、路径、文字
			// - getImageData()、putImageData() 读取或写入像素数据
			// - createLinearGradient()、createPattern() 等生成填充样式
		const pencilTextureCtx = pencilTextureCanvas.getContext('2d');
		const pencilSetWidthHeight = Math.max(_width,_height);
		pencilTextureCtx.drawImage(
			pencilTextureEl,
			0,0,
			1200,1200,
			0,0,
			pencilSetWidthHeight,pencilSetWidthHeight
		);
		pencilTexturePixel = pencilTextureCtx.getImageData(0,0,_width,_height);


		// 处理暗面
		// 生成一张基于灰度阈值的“初步阴影掩码”，并在 Alpha 通道里引入随机噪点
		// 经过这段代码后，shadePixel 里保存了一张二值化＋随机透明度的“原始阴影掩码”
		shadePixel = ctx.createImageData(_width, _height);

		for (let i = 0; i < pixelData.length; i += 4) {
			let y = pixelData[i];

			y = y > shadeLimit ? 0 : 255; //((255 - pencilTexturePixel.data[i]) + Math.random() * 40 - 20);

			// y = Math.max(255-y) * 0.6;

			shadePixel.data[i    ] = y;
			// 这一通道在后面合成 “单色灰度” 或者“Alpha 计算” 时并不参与阴影强度判断，仅起到一个“占位”或“中性色”的作用
			shadePixel.data[i + 1] = 128;
			shadePixel.data[i + 2] = 128;
			// A（alpha）通道用一个 0–254 的随机值填充，目的是让掩码看起来“带有颗粒／噪点感”。后面通过下采样（canvasShadeMin）并再次上采样到原尺寸后，这些随机透明度会制造出粗糙的噪点效果，使阴影看上去更像铅笔手绘的颗粒
			shadePixel.data[i + 3] = Math.floor(Math.random() * 255)//Math.ceil( y + Math.random() * 40 - 20);
		}

		// /*
		// document.body.appendChild(canvasShade)

		const ctxShade = canvasShade.getContext('2d');
		const ctxShadeMin = canvasShadeMin.getContext('2d');
		
		canvasShade.width = _width;
		canvasShade.height = _height;

		// console.log({shadePixel})

		// 先把上一阶段生成的二值＋随机 Alpha 的掩码写入 canvasShade
		ctxShade.putImageData(shadePixel, 0, 0);

		// ctxShade.fillText('123233',50,50);

		// === 以下开始“下采样-->上采样”流程，用于制造颗粒/模糊感 ===
		const shadeZoom = 4;
		canvasShadeMin.width = Math.floor(_width/shadeZoom);
		canvasShadeMin.height = Math.floor(_height/shadeZoom);

		// 1. 把 canvasShade（原始尺寸）画到 canvasShadeMin（缩小后的尺寸）
		//    这样会把随机 alpha 随着像素一起压缩，从而让噪点聚合，产生颗粒效果
		ctxShadeMin.drawImage(
			canvasShade,
			0,0,
			canvasShadeMin.width,canvasShadeMin.height
		);
		// 2. 清空 canvasShade，然后把 canvasShadeMin 再放回到 canvasShade（恢复到原始尺寸）
		//   恢复时的插值会进一步让噪点和边缘变得更柔和
		ctxShade.clearRect(0,0,_width,_height)
		ctxShade.drawImage(
			canvasShadeMin,
			0,0,
			_width,_height
		);
		// 3. 从 canvasShade 上重新读取一次像素，得到“下采样→上采样”后具有颗粒／模糊效果的遮罩
		shadePixel = ctxShade.getImageData(0,0,_width,_height);

		// === 以下遍历 shadePixel，根据铅笔纹理和 shadeLight 去调整最终的“阴影强度” ===
		for (let i = 0; i < shadePixel.data.length; i += 4) {
			// 取当前像素经过下/上采样后，在 R 通道上的灰度值（0–255）
			let y = shadePixel.data[i];
			// 结合铅笔纹理：pencilTexturePixel.data[i] 代表同一位置纹理图的灰度值（0–255）
			//   (255 - pencilTexturePixel.data[i]) / 255 得到“纹理反转后”的归一化强度（0–1）
			// 再用 y/255 表示当前遮罩在 R 通道上的“占用比例”（0–1）
			// 最后乘以 shadeLight（一个控制阴影总亮度的参数），得到最终阴影值 y_new
			y = Math.round((255-pencilTexturePixel.data[i]) / 255 * y / 255 * shadeLight); //((255 - pencilTexturePixel.data[i]) + Math.random() * 40 - 20);

			// y = Math.max(255-y) * 0.6;
			// 把计算后的 y 写回 R 通道，覆盖原来的粗糙值
			// “由初步掩码 × 铅笔纹理 × 全局亮度系数”共同决定的真正阴影强度
			shadePixel.data[i    ] = y;
			// （注意：这里只修改了 R 通道，G/B/A 通道保留了之前下/上采样时遗留的数据，
			//   在后续阶段使用时，只会读取 R 通道的数值来合成阴影强度）
		}

	}

	// 亮度提升
	const { 
		light = 0,
	} = config;
	// 若 light > 0，则对每个像素的灰度值进行提升
	// 若 light = 0，则不进行任何亮度调整
	if(light){

		
		for (let i = 0; i < pixelData.length; i += 4) {
			let y = pixelData[i];
			// 亮度提升 light / 100
			y = y + y * (light/100);
			// 将计算后的新灰度同时赋值给 R/G/B，保持仍然是灰度图；Alpha 通道不变
			pixelData[i    ] = y;
			pixelData[i + 1] = y;
			pixelData[i + 2] = y;
		}

		// ctx.putImageData(pixel, 0, 0);
		// pixel = ctx.getImageData(0, 0, _width, _height);
	}

	// 在“灰度化”之后，通过不同的 weights（如均值滤波、高通滤波、差分算子等）灵活地进行去噪、边缘检测、模糊、锐化等处理
	// 为后续的线稿渲染、阴影合成、渐变叠加提供合适的基础灰度图
	if(config.denoise){
		pixel = convoluteY(
			pixel,
			[
				1/9, 1/9, 1/9,
				1/9, 1/9, 1/9,
				1/9, 1/9, 1/9
			],
			ctx
		);
	}

	// convoluteMatrix：config 卷积核（精细、一般、稍粗、超粗、极粗等）（一维数组）
	// pixel：灰度化的 ImageData 对象
	// convoluteY：对灰度图进行卷积处理
	// pixel1：应用第一个卷积核后的 ImageData 对象，如果没有指定卷积核，则仍为原始灰度图
	const convoluteMatrix = config.Convolutes[config.convoluteName];
	let pixel1 = convoluteMatrix ? convoluteY(
		pixel,
		convoluteMatrix,
		ctx
	) : pixel;

	// if(config.contrast){
	// 	for (let i = 0; i < pixel1.data.length; i +=4) {
	// 		let r = (pixel1.data[i]-128) * config.contrast + 128;
	// 		pixel1.data[i  ] = r;
	// 		pixel1.data[i+1] = r;
	// 		pixel1.data[i+2] = r;
	// 		pixel1.data[i+3] = 255;
	// 	}
	// }

	/**
	 * 整个 louvre 函数能够灵活地在多种滤镜/卷积效果之间切换，或者自动叠加“边缘差分”效果，
	 * 从而丰富最终输出的铅笔风格或者水彩风格图像的细节表现
	 */
	// 当 config.convolute1Diff 为 true 时，表示需要对比两个卷积核的结果
	if(convoluteMatrix && config.convolute1Diff){
		// 用“差分之后的图”覆盖原来的 pixel。这种做法通常用于“边缘检测”或“高频增强”：
		// 如果第一个卷积核是低通滤波（模糊），第二个卷积核是高通（锐化或边缘检测），那么它们相减就会突出边缘信息
		// 偏置 128 是为了让中性灰（无边缘）落在中间色阶
		let pixel2 = config.convoluteName2 ? convoluteY(
			pixel,
			config.Convolutes[config.convoluteName2],
			ctx
		) : pixel;

		// console.log(/pixel2/,config.Convolutes[config.convoluteName2],pixel2);
		// pixelData
		for (let i = 0; i < pixel2.data.length; i +=4) {
			let r = 128 + pixel2.data[i  ] - pixel1.data[i  ];
			pixel2.data[i  ] = r;
			pixel2.data[i+1] = r;
			pixel2.data[i+2] = r;
			pixel2.data[i+3] = 255;
		}
		pixel = pixel2;
	}else{
		// 不对比
		pixel = pixel1;
	}

	pixelData = pixel.data;


	if(convoluteMatrix)

	/**
	 * 对已经卷积（或差分）后的灰度图像再做一次线性亮度区间重映射，以去除过亮或过暗的极端像素，
	 * 并将剩余的亮度拉伸到整个 [0,255] 范围，从而增强对比度
	 */
	if(config.lightCut || config.darkCut){
		// 将原始灰度 [config.darkCut, 255 - config.lightCut] 这个区间映射到新的 [0,255]
		const scale = 255 / (255 - config.lightCut - config.darkCut);
		for (let i = 0; i < pixelData.length; i += 4) {
			let y = pixelData[i];

			y = (y - config.darkCut) * scale;
			
			y = Math.max(0,y);
			
			pixelData[i+0 ] = y
			pixelData[i+1 ] = y
			pixelData[i+2 ] = y
			pixelData[i+3 ] = 255
		}
	}

	/**
	 * 将先前得到的灰度线稿/阴影信息与一个预定义的彩色渐变做“融合”
	 * •R/G/B ← 某位置的渐变色（整幅图都会被渐变填充）
	 * •A （不透明度） ← 使得原来更暗的线稿区域（或阴影区域）更透出底色，原来更亮（白）的区域不透明。
	 */
	if(config.kuma){

		const hStart = 30;
		const hEnd = -184;
	
		// const be = bezier(0.57, 0.01, 0.43, 0.99);
		// const s = config.s/100;
	
		// 渐变方向是斜对角，从画布左上到右下
		const gradient = ctx.createLinearGradient(0,0, _width,_height);
	
		gradient.addColorStop(0, '#fbba30');
		gradient.addColorStop(0.4, '#fc7235');
		gradient.addColorStop(.6, '#fc354e');
		gradient.addColorStop(.7, '#cf36df');
		gradient.addColorStop(.8, '#37b5d9');
		gradient.addColorStop(1, '#3eb6da');

		// 修改绘图样式
		ctx.fillStyle = gradient;
		// 填充渐变
		ctx.fillRect(0, 0, _width, _height);
		let gradientPixel = ctx.getImageData(0, 0, _width, _height);
		
		for (let i = 0; i < pixelData.length; i += 4) {
			let y = pixelData[i];
			let p = Math.floor(i / 4);
	
			let _h = Math.floor(p/_width);
			let _w = p % _width;
	
			/*
			
			// const 
			// hScale = hScale * hScale;
	
			let hScale = (_h + _w)/(_width + _height);
	
			hScale = hScale * hScale;
			hScale = be(hScale);
	
			// let h = Math.floor((hStart + (hScale) * (hEnd - hStart)));
			let [h] = rgb2hsl([
				gradientPixel.data[i + 0],
				gradientPixel.data[i + 1],
				gradientPixel.data[i + 2],
			]);
			const l = y/255;
			const rgb = hsl2rgb([h, s, l * (1 - config.l/100) + (config.l/100)]);
	
			if(i%5677===0){
				// console.log(h,y,l,l * (config.l/100) + (1 - config.l/100))
				// console.log((_h + _w)/(_width + _height),hScale)
			}
	
			pixelData[i+0 ] = rgb[0];
			pixelData[i+1 ] = rgb[1];
			pixelData[i+2 ] = rgb[2];
			pixelData[i+3 ] = 255;
			*/

			// 直接使用渐变色填充 R G B
			pixelData[i+0 ] = gradientPixel.data[i + 0];
			pixelData[i+1 ] = gradientPixel.data[i + 1];
			pixelData[i+2 ] = gradientPixel.data[i + 2];
			// 0 -> 完全透明 255 -> 不透明
			y = 255 - y;
			if(config.shade){
				// 在“线稿轮廓”的基础上，还“额外”透出铅笔质感的粗颗粒阴影
				y = Math.max(
					y,
					shadePixel.data[i]
				);
			}
			pixelData[i+3 ] = y
		}
	
	}


	// for(let i = 0;i < pixelData.length;i += 4){

	// 	let _rgb = yuv2rgb(
	// 		pixelData[i],
	// 		pixelData[i+1],
	// 		pixelData[i+2],
	// 	);

	// 	pixelData[i   ] = _rgb[0];
	// 	pixelData[i+1 ] = _rgb[1];
	// 	pixelData[i+2 ] = _rgb[2];
	// }

	// blurC();
	/**
	 * 利用一个比主画布尺寸更小的临时画布 canvasMin，通过一次向下缩放（下采样）再向上放大（上采样）来实现图像的“轻度模糊”和“自然柔和”效果。
	 * 它借助浏览器自带的图像插值机制，无需编写复杂的卷积代码，就能让铅笔线稿／阴影的颗粒感更自然，看起来更像手绘，而不是生硬的纯算法输出。
	 */
	ctx.putImageData(pixel, 0, 0);

	const ctxMin = canvasMin.getContext('2d');

	canvasMin.width = Math.floor(_width/1.4);
	canvasMin.height = Math.floor(_height/1.3);

	ctxMin.clearRect(0,0,canvasMin.width,canvasMin.height)
	ctxMin.drawImage(
		canvas,
		0,0,
		canvasMin.width,canvasMin.height
	);
	
	ctx.clearRect(0,0,_width,_height)
	ctx.drawImage(
		canvasMin,
		0,0,
		canvasMin.width,canvasMin.height,
		0,0,_width,_height
	);

	// one-last-image-logo-color.png
	if(config.watermark){
		// const watermarkImageEl = await loadImagePromise('one-last-image-logo2.png');

		const watermarkImageWidth = watermarkImageEl.naturalWidth;
		const watermarkImageHeight = watermarkImageEl.naturalHeight / 2;
		let setWidth = _width * 0.3;
		let setHeight = setWidth / watermarkImageWidth * watermarkImageHeight;

		// 画布比较偏“横长”
		if( _width / _height  > 1.1 ){
			setHeight = _height * 0.15;
			setWidth = setHeight / watermarkImageHeight * watermarkImageWidth;
		}
	
		let cutTop = 0;
	
		if(config.hajimei){
			cutTop = watermarkImageHeight;
		}
		// 水印会“悬浮”在右下角，距离右侧和底部都留出一点空隙，并且空隙与水印高度成正比，
		// 无论水印实际大小如何，都有合理留白
		let setLeft = _width - setWidth - setHeight * 0.2;
		let setTop = _height - setHeight - setHeight * 0.16;
		ctx.drawImage(
			watermarkImageEl,
			0,cutTop,
			watermarkImageWidth,watermarkImageHeight,
			setLeft, setTop,
			setWidth, setHeight
		);
	}

	const outputCtx = outputCanvas.getContext('2d');

	outputCanvas.width = _width;
	outputCanvas.height = _height;
	// 填充纯白
	outputCtx.fillStyle = '#FFF';
	outputCtx.fillRect(0,0,_width,_height);
	outputCtx.drawImage(
		canvas,
		0,0,_width,_height
	);

	console.timeEnd('louvre');
	// return canvas.toDataURL('image/png');
	
};

let loadImage = (url,onOver)=>{
	const el = new Image();
	el.onload = _=>onOver(el);
	el.src = url;
};
let loadImagePromise = async url=>{
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			const el = new Image();
			el.onload = _=>resolve(el);
			el.onerror = e=>reject(e);
			el.src = url;
		}, 2000);
	});
}

let watermarkImageEl;
let pencilTextureEl;
const louvreInit = onOver=>{
	loadImage('pencil-texture.jpg',el=>{
		pencilTextureEl = el;
		loadImage('one-last-image-logo2.png',el=>{
			watermarkImageEl = el;
			onOver();
		});
	});
};


let convolute = (pixels, weights, ctx) => {
	const side = Math.round(Math.sqrt(weights.length));
	const halfSide = Math.floor(side / 2);
	const src = pixels.data;
	const sw = pixels.width;
	const sh = pixels.height;

	const w = sw;
	const h = sh;
	const output = ctx.createImageData(w, h);
	const dst = output.data;


	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const sy = y;
			const sx = x;
			const dstOff = (y * w + x) * 4;
			let r = 0, g = 0, b = 0;
			for (let cy = 0; cy < side; cy++) {
				for (let cx = 0; cx < side; cx++) {
					const scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
					const scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
					const srcOff = (scy * sw + scx) * 4;
					const wt = weights[cy * side + cx];
					r += src[srcOff] * wt;
					g += src[srcOff + 1] * wt;
					b += src[srcOff + 2] * wt;
				}
			}
			dst[dstOff] = r;
			dst[dstOff + 1] = g;
			dst[dstOff + 2] = b;
			dst[dstOff + 3] = 255;
		}
	}


	// for (let y=0; y<h; y++) {
	// 	for (let x=0; x<w; x++) {
	// 		const srcOff = (y*w+x)*4;
	// 		src[srcOff] = dst[srcOff];
	// 	}
	// }
	return output;
};



// 只针对单通道（灰度）进行卷积，最终将结果复制到 R/G/B 三个通道，实现对整张图像的“均匀”灰度滤波
// 在“灰度化”之后，通过不同的 weights（如均值滤波、高通滤波、差分算子等）灵活地进行去噪、边缘检测、模糊、锐化等处理，为后续的线稿渲染、阴影合成、渐变叠加提供合适的基础灰度图
 const convoluteY = (pixels, weights, ctx) => {
	// 1. 计算卷积核的尺寸
	const side = Math.round( Math.sqrt( weights.length ) );
	const halfSide = Math.floor(side / 2);

	const src = pixels.data;	// 原始像素的 Uint8ClampedArray

	const w = pixels.width;		// 图像宽度
	const h = pixels.height;	// 图像高度

	// 2. 创建一个同样尺寸的输出 ImageData，用来存放卷积后的结果
	const output = ctx.createImageData(w, h);
	const dst = output.data;	// 输出像素的 Uint8ClampedArray

	 // 3. 对每个目标像素 (sy, sx) 执行以下操作：
	 // 图像索引 (y,x) → 灰度值 Y
	 // (0,0)  (0,1)  (0,2)
	 // 10     20     30
	 // (1,0)  (1,1)  (1,2)
	 // 40     50     60
	 // (2,0)  (2,1)  (2,2)
	 // 70     80     90
	 //
	 // pixels.data = [
		//  // (0,0)：
		//  10, 10, 10, 255,
		//  // (0,1)：
		//  20, 20, 20, 255,
		//  // (0,2)：
		//  30, 30, 30, 255,
		//  // (1,0)：
		//  40, 40, 40, 255,
		//  // (1,1)：
		//  50, 50, 50, 255,
		//  // (1,2)：
		//  60, 60, 60, 255,
		//  // (2,0)：
		//  70, 70, 70, 255,
		//  // (2,1)：
		//  80, 80, 80, 255,
		//  // (2,2)：
		//  90, 90, 90, 255
	 // ]
	 //
	 // const weights = [
	 //   1/9, 1/9, 1/9,
	 //   1/9, 1/9, 1/9,
	 //   1/9, 1/9, 1/9
	 // ];
	 for (let sy = 0; sy < h; sy++) {
		for (let sx = 0; sx < w; sx++) {
			// 3.1 计算当前目标像素在扁平数组（一维数组）中的起始下标
			const dstOff = (sy * w + sx) * 4;
			// 3.2 定义一个累加变量，用于存储“灰度卷积结果”
			let r = 0, g = 0, b = 0;
			// 3.3 遍历卷积核的每一个位置 (cy, cx)
			for (let cy = 0; cy < side; cy++) {
				for (let cx = 0; cx < side; cx++) {
					// 3.3.1 计算对应到原图像上的采样坐标 (scy, scx)
					//        采用“边缘扩展”策略：如果超出边界，则 clamp 到最接近的有效坐标
					const scy = Math.min(h - 1, Math.max(0, sy + cy - halfSide));
					const scx = Math.min(w - 1, Math.max(0, sx + cx - halfSide));
					// 3.3.2 计算取样像素的下标
					const srcOff = (scy * w + scx) * 4;
					// 3.3.3 从权重数组中取出对应位置的卷积系数
					const wt = weights[cy * side + cx];
					// 3.3.4 只累加 R 通道（此处假设输入已经是灰度图，
					//              因此 R/G/B 相等，只需拿 R 通道）
					r += src[srcOff] * wt;
					// g += src[srcOff + 1] * wt;
					// b += src[srcOff + 2] * wt;
					// 注：原代码中注释掉了对 G、B 通道的累加
					//      也就是说，无论输入是否真的是灰度图，都只用 R 通道参与计算
				}
			}

			// 3.4 将累加得到的 r 值写回输出像素的 R/G/B 通道，并把 Alpha 固定为 255
			dst[dstOff] = r;
			dst[dstOff + 1] = r;
			dst[dstOff + 2] = r;
			dst[dstOff + 3] = 255;
		}
	}


	// for (let y=0; y<h; y++) {
	// 	for (let x=0; x<w; x++) {
	// 		const srcOff = (y*w+x)*4;
	// 		src[srcOff] = dst[srcOff];
	// 	}
	// }

	 // 4. 返回经过灰度卷积处理后的完整 ImageData
	 return output;
};