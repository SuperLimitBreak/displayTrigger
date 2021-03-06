import {video} from 'src/screen/layers/video';


describe('Screen - Video Layer', function() {
    let videoLayer = undefined;
    let mockParentElement = undefined;
    let mockVideoElement = undefined;

    beforeEach(function() {
        mockParentElement = jasmine.createSpyObj('HTMLElement', ['appendChild']);
        mockVideoElement = jasmine.createSpyObj('HTMLVideoElement', ['remove', 'loop', 'volume', 'controls', 'preload', 'autoplay', 'currentSrc', 'src', 'pause', 'play', 'load', 'addEventListener', 'currentTime']);
        mockVideoElement.remove = ()=>{mockVideoElement = undefined;};
        mockVideoElement.currentSrc = '';
        mockVideoElement.currentTime = 0;
        videoLayer = new video(mockParentElement, {
            documentCreateElement: ()=>mockVideoElement,
        });
        expect(videoLayer).toBeDefined();
    });

    afterEach(function() {
        videoLayer = undefined;
        mockParentElement = undefined;
        mockVideoElement = undefined;
    });

    it('Should only construct video element on get if one does not already exisit',()=>{
        const video_element1 = videoLayer.video;
        expect(video_element1).toBeDefined();
        expect(mockParentElement.appendChild).toHaveBeenCalled();
        mockParentElement.appendChild.calls.reset();
        const video_element2 = videoLayer.video;
        expect(video_element1).toBe(video_element2);
        expect(mockParentElement.appendChild).not.toHaveBeenCalled();
    });

    const video_url = 'http://video.com/video.mp4';

    it('Should not play on load',()=>{
        videoLayer.load({src: video_url});
        expect(mockVideoElement.play).not.toHaveBeenCalled();
        expect(mockVideoElement.autoplay).toBe(false);
        expect(mockVideoElement.src).toBe(video_url);
    });

    it('Should play when play command sent',()=>{
        videoLayer.load({src: video_url});
        mockVideoElement.currentSrc = video_url;  // The html element set's this value, as 'src' is a not a string.
        expect(mockVideoElement.pause).not.toHaveBeenCalled();  // Detection of existing video should result on pause being called
        videoLayer.load({src: video_url});
        expect(mockVideoElement.pause).toHaveBeenCalled();  // loading the same video again should pause current execution

        //mockVideoElement.currentSrc = video_url;
        expect(mockVideoElement.play).not.toHaveBeenCalled();
        videoLayer.play({src: video_url});
        expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it('Should remove element on clear',()=>{
        expect(videoLayer.video).toBeDefined();
        videoLayer.clear();
        expect(mockVideoElement).not.toBeDefined();
        expect(videoLayer._video_lement).not.toBeDefined();
    });

    it('Should seek when position is outside threshold range',()=>{
        videoLayer.play({src: video_url});
        expect(mockVideoElement.currentTime).toBe(0);
        videoLayer.play({src: video_url, position: 10});
        expect(mockVideoElement.currentTime).toBe(10);
        videoLayer.play({src: video_url, position: 10.01});
        expect(mockVideoElement.currentTime).toBe(10);
    });

});
