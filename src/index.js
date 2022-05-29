import '@kitware/vtk.js/favicon';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';

import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';

import vtkImageCroppingWidget from '@kitware/vtk.js/Widgets/Widgets3D/ImageCroppingWidget';
import vtkImageCropFilter from '@kitware/vtk.js/Filters/General/ImageCropFilter';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkXMLImageDataReader      from '@kitware/vtk.js/IO/XML/XMLImageDataReader';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

let presetColorMapName = "Cold and Hot"

const overlaySize = 15;
const overlayBorder = 2;
const overlay = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.width = `${overlaySize}px`;
overlay.style.height = `${overlaySize}px`;
overlay.style.border = `solid ${overlayBorder}px red`;
overlay.style.borderRadius = '50%';
overlay.style.left = '-100px';
overlay.style.pointerEvents = 'none';
document.querySelector('body').appendChild(overlay);

const fileInput = document.getElementById('volumeFile');
fileInput.addEventListener('change', handleFile);
const projectMenu = document.getElementById('projectMenu')
projectMenu.addEventListener('change',handleMenu)

document.getElementById('presets-menu').addEventListener('change', function () {
    presetColorMapName = this.value;
    lookupTable.applyColorMap(vtkColorMaps.getPresetByName(presetColorMapName));
    renderChest();
});

let latestVolume;
function handleFile(e) {
    e.preventDefault();
    e.stopPropagation();
    const dataTransfer = e.dataTransfer;
    const files = e.target.files || dataTransfer.files;
    if (files.length === 1) {
        console.log(files[0])
        const reader = new FileReader();
        reader.onload = function onLoad(e) {
            if (projectMenu.value == "rayCasting"){      
                latestVolume = reader.result         
                renderChest(reader.result);
            }
            if (projectMenu.value == "surfaceRendereing"){
                latestVolume = reader.result         
                renderHead(reader.result);
            }
        };
        reader.readAsArrayBuffer(files[0]);
    }
}

function updateIsoValue(e) {
    const isoValue = Number(e.target.value);
    marchingCube.setContourValue(isoValue);
    renderWindow.render();
}

function updateFlag(e, croppingWidget) {
    console.log(croppingWidget)
    const value = !!e.target.checked;
    const name = e.currentTarget.dataset.name;
    croppingWidget.set({ [name]: value });
    widgetManager.enablePicking();
    renderWindow.render();
}


function handleMenu() {
    const rayCastControls = document.getElementById('rayCastControls');
    const isoControl = document.getElementById('isoMenu');
    const TransferFunction = document.getElementById('TransferFunction');
    const presetsControl = document.getElementById('presetsMenu');
    
    if (projectMenu.value == "rayCasting"){
        isoControl.style.visibility = 'hidden';
        rayCastControls.style.visibility = 'visible';
        TransferFunction.style.visibility = 'visible';
        presetsControl.style.visibility = 'visible';
        renderChest(latestVolume);
    }
    if (projectMenu.value == "surfaceRendereing"){
        isoControl.style.visibility = 'visible';
        rayCastControls.style.visibility = 'hidden';
        presetsControl.style.visibility = 'hidden';
        TransferFunction.style.visibility = 'hidden';
        renderHead(latestVolume);
    }
}

const main = document.querySelector('#container');

/* Create The Window */
const genericRenderWindow = vtkGenericRenderWindow.newInstance({background: [0, 0, 0],});
genericRenderWindow.setContainer(main);
genericRenderWindow.resize();

const renderer = genericRenderWindow.getRenderer();
const renderWindow = genericRenderWindow.getRenderWindow();

/* Set up the Skull Compontents */
const skullSource = vtkXMLImageDataReader.newInstance()
const skullActor =  vtkActor.newInstance();
const skullMapper =  vtkMapper.newInstance();
const marchingCube = vtkImageMarchingCubes.newInstance({ contourValue: 0.0, computeNormals: true,mergePoints: true,});
skullActor.setMapper(skullMapper);
skullMapper.setInputConnection(marchingCube.getOutputPort(0))
marchingCube.setInputConnection(skullSource.getOutputPort(0))

/* Set up the Chest Compontents */
const chestSource = vtkXMLImageDataReader.newInstance()
const chestActor =  vtkVolume.newInstance();
const chestMapper =  vtkVolumeMapper.newInstance();
chestMapper.setSampleDistance(1.1);
chestActor.setMapper(chestMapper);

const globalDataRange = [0, 255];
const lookupTable = vtkColorTransferFunction.newInstance();
const piecewiseFun = vtkPiecewiseFunction.newInstance();

lookupTable.applyColorMap(vtkColorMaps.getPresetByName(presetColorMapName));
lookupTable.setMappingRange(0, 256);
lookupTable.updateRange();
for (let i = 0; i <= 8; i++) {
    piecewiseFun.addPoint(i * 32, i / 8);
}

chestActor.getProperty().setRGBTransferFunction(0, lookupTable);
chestActor.getProperty().setScalarOpacity(0, piecewiseFun);
chestActor.getProperty().setInterpolationTypeToFastLinear();

/* Set up the Widget Compontents */
const widgetManager = vtkWidgetManager.newInstance();
widgetManager.setRenderer(renderer);
const widget = vtkImageCroppingWidget.newInstance();
// widgetRegistration();

const adjustableTransferFunctionWidget = vtkPiecewiseGaussianWidget.newInstance({
    numberOfBins: 256,
    size: [400, 150],
});
adjustableTransferFunctionWidget.updateStyle({
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    histogramColor: 'rgba(100, 100, 100, 0.5)',
    strokeColor: 'rgb(0, 0, 0)',
    activeColor: 'rgb(255, 255, 255)',
    handleColor: 'rgb(50, 150, 50)',
    buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
    buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
    buttonStrokeColor: 'rgba(0, 0, 0, 1)',
    buttonFillColor: 'rgba(255, 255, 255, 1)',
    strokeWidth: 2,
    activeStrokeWidth: 3,
    buttonStrokeWidth: 1.5,
    handleWidth: 3,
    iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
    padding: 10,
});

// ----------------------------------------------------------------------------
// Default setting Piecewise function widget
// ----------------------------------------------------------------------------

adjustableTransferFunctionWidget.addGaussian(0.425, 0.5, 0.2, 0.3, 0.2);
adjustableTransferFunctionWidget.addGaussian(0.75, 1, 0.3, 0, 0);

const transferFunctionContainer = document.querySelector('#TransferFunction');
adjustableTransferFunctionWidget.setContainer(transferFunctionContainer);
adjustableTransferFunctionWidget.bindMouseListeners();
// adjustableTransferFunctionWidget.setSize(450, 150);

adjustableTransferFunctionWidget.onAnimation((start) => {
    if (start) {
        renderWindow.getInteractor().requestAnimation(adjustableTransferFunctionWidget);
    } else {
        renderWindow.getInteractor().cancelAnimation(adjustableTransferFunctionWidget);
    }
});

adjustableTransferFunctionWidget.onOpacityChange(() => {
    adjustableTransferFunctionWidget.applyOpacity(piecewiseFun);
    if (!renderWindow.getInteractor().isAnimating()) {
        renderWindow.render();
    }
});
function renderHead(results) {
    renderer.removeAllViewProps();
    renderWindow.render();
    skullSource.parseAsArrayBuffer(results);
    const data = skullSource.getOutputData(0);
    const dataArray = data.getPointData().getScalars() || data.getPointData().getArrays()[0];
    const dataRange = dataArray.getRange();
    const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

    const el = document.querySelector('.isoValue');
    el.setAttribute('min', dataRange[0]);
    el.setAttribute('max', dataRange[1]);
    el.setAttribute('value', firstIsoValue);
    el.addEventListener('input', updateIsoValue);

    marchingCube.setContourValue(firstIsoValue);
    renderer.addActor(skullActor);
    renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
    renderer.resetCamera();
    renderWindow.render();
}

async function renderChest(results) {
    try {
        renderer.removeAllViewProps();
        genericRenderWindow.resize();
        renderWindow.render();

        // await chestSource.setUrl('https://kitware.github.io/vtk-js/data/volume/LIDC2.vti');
        // await chestSource.loadData();
        chestSource.parseAsArrayBuffer(results);
        const imageData = chestSource.getOutputData();
        const dataArray = imageData.getPointData().getScalars();
        const dataRange = dataArray.getRange();
        globalDataRange[0] = dataRange[0];
        globalDataRange[1] = dataRange[1];

        const croppingWidget = vtkImageCroppingWidget.newInstance();
        const cropFilter = vtkImageCropFilter.newInstance();
        const cropState = croppingWidget.getWidgetState().getCroppingPlanes();

        adjustableTransferFunctionWidget.setDataArray(dataArray.getData());
        adjustableTransferFunctionWidget.applyOpacity(piecewiseFun);

        adjustableTransferFunctionWidget.setColorTransferFunction(lookupTable);
        lookupTable.onModified(() => {
            adjustableTransferFunctionWidget.render();
            renderWindow.render();
        });

        cropFilter.setInputConnection(chestSource.getOutputPort());
        chestMapper.setInputConnection(cropFilter.getOutputPort());

        cropState.onModified(() =>
            cropFilter.setCroppingPlanes(cropState.getPlanes())
        );

        // initCroppingEventListeners(croppingWidget);
        widgetManager.addWidget(croppingWidget);
        renderer.addVolume(chestActor);

        const elems = document.querySelectorAll('.flag');
        for (let i = 0; i < elems.length; i++) {
            elems[i].addEventListener('change', (e) => updateFlag(e, croppingWidget));
        }

        const buttons = document.querySelectorAll('button');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', widgetRegistration);
        }
        // update lookup table mapping range based on input dataset
        const range = chestSource.getOutputData().getPointData().getScalars().getRange();
        lookupTable.setMappingRange(...range);
        lookupTable.updateRange();

        // update crop widget and filter with image info
        const image = chestSource.getOutputData();
        cropFilter.setCroppingPlanes(...image.getExtent());
        croppingWidget.copyImageDataDescription(image);

        // --- Enable interactive picking of widgets ---
        widgetManager.enablePicking();
        renderWindow.render();

        // --- Reset camera and render the scene ---
        renderer.resetCamera();
        genericRenderWindow.resize();
        renderWindow.render();
    }
    catch (e) { console.log(e) }
    
}
// renderChest()
