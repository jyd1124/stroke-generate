// 文件 file -> URL ("data:image/png;base64,iVBORw0KGgoAAAANSUhE...")
const readFileToURL = (file,onOver)=>{
	var reader = new FileReader();
	reader.onload = ()=>{
		const src = reader.result;
		onOver(src);
	};
	reader.readAsDataURL(file);
};

// 将文件 file -> app.src
// app 是你的 Vue 根实例，app.src 通常会绑定到模板中的 <img :src="src">
// 把用户选中的文件异步读成 Base64 data URL，然后把这个 URL 推给你的 Vue 应用，让页面上对应的 <img> 自动显示这张图
const readFileAndSetIMGSrc = file=>{
	readFileToURL(file,src=>{
		app.src = src;
	});
};

const isImageRegex = /^image\/(jpeg|gif|png|bmp|webp)$/;

document.addEventListener('paste',e=>{
	// console.log(e.clipboardData,e.clipboardData.files);

	const clipboardData = e.clipboardData;
	if(clipboardData.items[0]){
		let file = clipboardData.items[0].getAsFile();

		if(file && isImageRegex.test(file.type)){
			return readFileAndSetIMGSrc(file);
		}
	}

	if(clipboardData.files.length){
		for(let i = 0;i<clipboardData.files.length;i++){
			if(isImageRegex.test(clipboardData.files[i].type)){
				// console.log(clipboardData.files[i])
				readFileAndSetIMGSrc(clipboardData.files[i]);
			}
		}
	}
});

document.addEventListener('dragover',e=>{
	e.preventDefault();
});
document.addEventListener('drop',e=>{
	e.preventDefault();

	const file = e.dataTransfer.files[0];

	if(file && file.type.match(isImageRegex)){
		readFileAndSetIMGSrc(file);
	}
});

const _louvre = (img,style,callback)=>{

	clearTimeout(louvre.T);
	louvre.T = setTimeout(()=>{
		louvre(img,style,callback);
		app.saveData();
	},100);
};

const deepCopy = o=>JSON.parse(JSON.stringify(o));





const creatConvoluteCenterHigh = (w,centerV)=>{
	const arr = [];
	const c = Math.floor((w*w)/2);

	for(let x = 0; x < w; x++){
		for(let y = 0; y < w; y++){
			let i = x * w + y;
			arr[i] = -1;

			if(i===c){
				arr[i] = centerV;
			}
		}
	}
	return arr;
}
const creatConvoluteAverage = (w)=>new Array(w*w).fill(1/(w*w))


const Convolutes = {
	// '右倾': [
	// 	0, -1, 0,
	// 	-1, 2, 2,
	// 	0, -1, 0
	// ],
	// '左倾': [
	// 	0, -1, 0,
	// 	3, 2, -2,
	// 	0, -1, 0
	// ],
	// '极细':   creatConvoluteAverage(3),
	'精细':  creatConvoluteAverage(5),
	'一般':  creatConvoluteAverage(7),
	'稍粗':  creatConvoluteAverage(9),
	'超粗':  creatConvoluteAverage(11),
	'极粗':  creatConvoluteAverage(13),
	// '12421': [
	// 	-3,2,-3,
	// 	 2,4, 2,
	// 	-3,2,-3,
	// ],
	// '9,-1,8': [
	// 	-1 ,-1 ,-1 ,
	// 	-1 , 9 ,-1 ,
	// 	-1 ,-1 ,-1 ,
	// ],
	// '25,-1,24':creatConvoluteCenterHigh(5,24),
	// '25,-1,25': creatConvoluteCenterHigh(5,25),
	// '25,-1,26': [
	// 	-1 , -1 , -1 , -1 , -1 ,
	// 	-1 , -1 , -1 , -1 , -1 ,
	// 	-1 , -1 , 26 , -1 , -1 ,
	// 	-1 , -1 , -1 , -1 , -1 ,
	// 	-1 , -1 , -1 , -1 , -1 ,
	// ],
	// '-1,0,16': [
	// 	-1 , -1 , -1 , -1 , -1 ,
	// 	-1 ,  0 ,  0 ,  0 , -1 ,
	// 	-1 ,  0 , 17 ,  0 , -1 ,
	// 	-1 ,  0 ,  0 ,  0 , -1 ,
	// 	-1 , -1 , -1 , -1 , -1 ,
	// ],
	'浮雕': [
		1, 1, 1,
		1, 1, -1,
		-1, -1, -1
	],
	'线稿':  null,
}

const style = {
	zoom:1,
	light:0,
	shadeLimit: 108,
	shadeLight: 80,
	// s:80,
	// l:50,
	shade: true,
	kuma: true,
	hajimei: false,
	watermark: true,
	convoluteName: '一般',
	convolute1Diff: true,
	convoluteName2: null,
	Convolutes,
	// contrast: 30,
	// invertLight: false,
	// hue:false,
	// hueGroup: 255,
	// lightGroup: 1,
	lightCut: 128,
	darkCut: 118,
	denoise: true,
};


const convolutes = Object.keys(Convolutes);


const defaultImageURL = 'images/asuka-8.jpg';


const maxPreviewWidth = Math.min(800,document.body.offsetWidth);
let previewWidth = maxPreviewWidth;
let previewHeight = Math.round(previewWidth * 0.593);

const data = {
	src: defaultImageURL,
	defaultImageURL,
	style,
	runing: true,
	convolutes,
	diff: false,
	output: '',
	downloadFilename: '[One-Last-Image].jpg',
	previewWidth,
	previewHeight,
	lyrics: null,
	loading: true,
	lyricIndex: 0,

	bevelPosition:20,
};


const chooseFileForm = document.createElement('form');
const chooseFileInput = document.createElement('input');
chooseFileInput.type = 'file';
chooseFileInput.accept = 'image/*';
chooseFileForm.appendChild(chooseFileInput);

const chooseFile = callback=>{
	chooseFileForm.reset();
	chooseFileInput.onchange = function(){
		if(!this.files||!this.files[0])return;
		callback(this.files[0]);
	};
	chooseFileInput.click();
};

const init= _=>{
	app.loading = false;
	// louvreInit 可能是你项目中用于准备 Canvas、WebGL 或滤镜算法的初始化函数。它接收一个回调，等所有底层资源（比如着色器、纹理、图像）准备就绪后再执行。
	louvreInit( _=>{
		// app.$refs.img 指向模板里用 ref="img" 标记的 <img> 元素
		const { img } = app.$refs;
		// 把它的 onload 事件挂到 app.setImageAndDraw，也就是当 <img> 的 src 变更并且图片真正加载完成后，就自动执行一次“设置尺寸并绘制到 Canvas”这套流程
		img.onload = app.setImageAndDraw;
		// 如果这个 <img> 在执行这段代码前就已经加载（比如使用的是默认 URL，且浏览器已缓存完毕），它的 complete 属性会是 true
		if(img.complete) img.onload();
	});
}

app = new Vue({
	el:'.app',
	data,
	methods: {
		init,
		_louvre(ms=300){
			app.runing = true;
			clearTimeout(app.T)
			app.T = setTimeout(app.louvre,ms)
		},
		// 初始化 louvre
		async louvre(){
			app.runing = true;
			this.$nextTick(async _=>{
				// 1. img：要处理的源图像元素（通过 ref="img" 获取）。
				// 2. outputCanvas：结果要绘制到的 <canvas>（通过 ref="canvas" 获取）。
				// 3. config：当前所有滤镜参数（如亮度、卷积核种类、去噪设置等），使用展开运算符合并到一个对象里。
				await louvre({
					img: app.$refs['img'],
					outputCanvas: app.$refs['canvas'],
					config: {
						...app.style,
						Convolutes,
					}
				});
				app.runing = false;
			})
		},
		// 画布处理
		async setImageAndDraw(){
			const { img } = app.$refs;
			const { naturalWidth, naturalHeight } = img;
			
			const previewWidth = Math.min(maxPreviewWidth, naturalWidth);
			const previewHeight = Math.floor(previewWidth / naturalWidth * naturalHeight);

			app.previewWidth = previewWidth;
			app.previewHeight = previewHeight;
			await app.louvre();
		},
		// 用户选中图片，将图片读成 Base64 data URL，然后把这个 URL 推给你的 Vue 应用，让页面上对应的 <img> 自动显示这张图
		chooseFile(){
			chooseFile(readFileAndSetIMGSrc)
		},
		save(){
			const { canvas } = app.$refs;
			// URL.createObjectURL()
			app.output = canvas.toDataURL('image/jpeg',.9);
			app.downloadFilename = `[lab.magiconch.com][One-Last-Image]-${+Date.now()}.jpg`;
		},
		saveDiff(){
			const { img,canvas } = app.$refs;
			const mixCanvas = document.createElement('canvas');
			const mixCanvasCtx = mixCanvas.getContext('2d');
			mixCanvas.width = canvas.width;
			mixCanvas.height = canvas.height * 2;
			mixCanvasCtx.drawImage(
				canvas,
				0,0,
				canvas.width,canvas.height
			);
			mixCanvasCtx.drawImage(
				img,
				0,0,
				img.naturalWidth,img.naturalHeight,
				0,canvas.height,
				canvas.width,canvas.height,
			);
			app.output = mixCanvas.toDataURL('image/jpeg',.9);
			app.downloadFilename = `[lab.magiconch.com][One-Last-Image]-diff-${+Date.now()}.jpg`;

		},
		saveDiff2(){
			const { img,canvas } = app.$refs;
			const mixCanvas = document.createElement('canvas');
			const mixCanvasCtx = mixCanvas.getContext('2d');
			mixCanvas.width = canvas.width;
			mixCanvas.height = canvas.height;
			mixCanvasCtx.drawImage(
				canvas,
				0,0,
				canvas.width,canvas.height
			);
			
			const { bevelPosition } = app;
			
			const topXScale = bevelPosition/100 + 0.24;
			const bottomXScale = bevelPosition/100 + 0.04;

			const topX = Math.floor(canvas.width * topXScale);
			const bottomX = Math.floor(canvas.width * bottomXScale);
			
			mixCanvasCtx.beginPath();
			mixCanvasCtx.moveTo(0,0);
			mixCanvasCtx.lineTo(topX,0);
			mixCanvasCtx.lineTo(bottomX,canvas.height);
			mixCanvasCtx.lineTo(0,canvas.height);
			mixCanvasCtx.closePath();

			const pattern = mixCanvasCtx.createPattern(img, 'no-repeat');
			mixCanvasCtx.fillStyle = pattern;
    		mixCanvasCtx.fill(); 
			app.output = mixCanvas.toDataURL('image/jpeg',.9);
			app.downloadFilename = `[lab.magiconch.com][One-Last-Image]-diff2-${+Date.now()}.jpg`;

		},
		_saveDiff2(ms = 100){
			const { saveDiff2 } = app;

			clearTimeout(saveDiff2.timer);
			saveDiff2.timer = setTimeout(saveDiff2,ms);
		},
		toDiff(){
			this.diff = true;

			document.activeElement = null;
		}
	},
	computed: {
		sizeStyle(){
			return {
				width: `${this.previewWidth}px`,
				height: `${this.previewHeight}px`,
			}
		},
		isDefaultImageURL(){
			return this.src !== this.defaultImageURL
		}
	},
	watch:{
		style:{
			deep:true,
			handler(){
				this._louvre();
			}
		},
		loading(v){
			document.documentElement.setAttribute('data-loading',v);
		},
		output(v){
			document.documentElement.setAttribute('data-output',!!v);
		},
	}
});

setTimeout(_=>{

	fetch('one-last-kiss.lrc').then(r=>r.text()).then(r=>{
		const lyrics = lyricParse(r);
		app.lyrics = lyrics;
		const lastLyric = lyrics[lyrics.length-1];
		const duration = lastLyric[0];
		
	
		const getCurrentTime = _=>{
			const now = +new Date()/1000;
			const currentTime = now % duration;
	
			return currentTime;
		};
		const getCurrentIndex = _=>{
			const currentTime = getCurrentTime();
	
	
			for(let i = lyrics.length - 1;i >= 0 ;i--){
				let lyric = lyrics[i]
				if(lyric[0] < currentTime){
					return i;
				}
			}
			return 0;
		};
		const getCurrentLyric = _=>{
			return lyrics[getCurrentIndex()]
		}
		setInterval(_=>{
			const index = getCurrentIndex();
			// const lyric = getCurrentLyric();
			app.lyricIndex = index;
	
		},500);
	})
},2000);