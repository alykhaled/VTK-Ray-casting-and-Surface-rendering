# VTK Ray Casting and Surface Rendering
Surface Rendering and Ray Casting example for web using VTK.js, HTML, Bootstrap and Javascript

## Screenshots
![image](https://user-images.githubusercontent.com/10764089/171009719-8bb783b0-cd08-4d19-bb80-42c1510c6cbe.png)
![image](https://user-images.githubusercontent.com/10764089/171010065-acaacef4-b89d-4ae9-914d-4851660d063b.png)
![image](https://user-images.githubusercontent.com/10764089/171010184-48c1e32a-827e-452b-b7eb-6168f949d391.png)
![image](https://user-images.githubusercontent.com/10764089/171010231-62ef8d0c-1857-4b1f-aece-28a5783e616a.png)
![image](https://user-images.githubusercontent.com/10764089/171010302-dbf21e3f-dded-4be3-9cbb-2c3e778ac39e.png)
![image](https://user-images.githubusercontent.com/10764089/171010424-d97ceab6-5a3f-4535-81ab-30b0342ffa02.png)
![image](https://user-images.githubusercontent.com/10764089/171010468-0c02c712-cee7-4a0f-8a4c-74702bbc0154.png)

## Features
- Surface rendering with adjustable iso value 
- Ray casting rendering with a Adjustable transfer function)
- interactive widget to cut the volume in the three perpendicular planes vtkImageCroppingWidget

## Issues
- Merging the two examples in one file
- Load the volume from our local computer
- Add the Dynamic Transfer Function
- Add a side bar with options

## Solutions
- We made a single genericWindow with to get the same renderer and renderer window and we made seprate Actor, Mapper, Filter and source for both the examples and then we made seprate function to render the example with the corresponding Actor, Mapper, Filter and source to the screen
- We used ```vtkXMLImageDataReader``` as the source for the both example and we add ```Input``` Tag to get the binaries of the volume and send it as a parameter to the render function for the both examples 
- We used ```vtkPiecewiseGaussianWidget``` widget 
- We used ```vtkGenericRenderWindow``` instead of ```vtkFullScreenRenderWindow``` to load the example in specific html container and not get the full screen so we can add some html

