TODO
====

* Assert asserts folder setup correctly and display error if needed
* Calibration image or mode


Links
=====

http://tympanus.net/Tutorials/MotionBlurEffect/
http://greensock.com/
http://greensock.com/morphSVG


Realtime Particle Effects
=========================

Kinect pointed at stage.

* Calibrate input
    * Registering all rest points. All future points within a euclidian threshold of these points are removed from the scene.
    * Screen transform matrix can be applied to ensure the audience looking at the screen appears in the correct perpective.
* Particles are mass's with velocity that are affected by the kinect nodes in 3d
* Possible effects
    * Fire (swerley fire)
        * Fire rises and cycles through colors
        * Particles attracted + replled from nodes.
        * z infront of blob apply force left, z behind blib force right. 
    * Rain
    * Water (knee high swoosh or splash?)
    * Shapes (The Crow?)
    * Floor Fire (DMX color and height?)
        * Saikano mood settings.
    * Beams
        * Disapaited by extreems of left/right?


Video with Alpha
================

https://developers.google.com/web/updates/2013/07/Alpha-transparency-in-Chrome-video?hl=en


Noise
=====

https://vimeo.com/29185333

    ffmpeg -i Super8Noise.mp4 -vf lutrgb="r=negval:g=negval:b=negval" Super8Noise.inverted.mp4