/*
Program: main.js 
Programmer: Shreya Kapoor 
Purpose: To create a 3D Map to view trees and parks within the City of Toronto 
Includes UI widgets for toggling basemaps, viewing elevation profiles, and line of sight.
*/

"use strict";


// this section imports the ArcGIS API for JS

require([
    "esri/config",
    "esri/Map",
    "esri/views/SceneView",
    "esri/symbols/WebStyleSymbol",
    "esri/layers/FeatureLayer",
    //add widget modules 
    "esri/widgets/BasemapToggle",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/ElevationProfile",
    "esri/widgets/LineOfSight",
    "esri/widgets/Expand"


], function (esriConfig, Map, SceneView,
    WebStyleSymbol,
    FeatureLayer,
    BasemapToggle, Legend, Home, ElevationProfile, LineOfSight, Expand) {

    // All access API Key created, which allows for the feature layers to be 
    // hosted and viewwed.     

    esriConfig.apiKey = "AAPTaV8XoYcyMx3XGYCgyIEnz3Q..cXkk1q5Dm-7xeGgmoMhi6kpw1pbLUP9rAtDI06tsHMCmZ1C84Z87Ki8C7a-ucU88YIvGx3qIei-2cqJMM7Iwq3qp3KiRXBPf5WG59k5PnKDTN7YHWvpBRzmGbfEvZ2xMnmKzUnEcJhHYPTFteGyIYGJH07X2usHhO_4Njn1gM38dE0FXpm0NYZKRDCKAdi5xpd19CO0d8XxF2CHHyoy-pW57rIGVGpFNwwTZsIoaRIwcPV2Vs_aZRbxTc-4.AT1_bxrQ3Qvz"


    //========================================
    // Map and Sceneview Configuration Section
    //========================================

    const mainMap = new Map({
        basemap: "streets",
        ground: "world-elevation"
    });

    const view = new SceneView({
        map: mainMap,
        container: "viewDiv",
        camera: {
            position: [
                -78.83,
                43.55,
                50000
            ],
            heading: 300,
            tilt: 45
        }
    });

    //========================================
    // Widgets Section 
    //========================================

    // Basemap Widget 

    let basemapWidget = new BasemapToggle({
        view: view,
        nextBasemap: "satellite"
    });

    view.ui.add(basemapWidget, "top-right");

    const elevationProfile = new ElevationProfile({
        view: view
    });

    // Elevation Widget 

    const expandElevation = new Expand({
        view: view,
        content: elevationProfile,
        expanded: false
    });

    view.ui.add(expandElevation, "bottom-left");

    // function implemented to ensure that the widget is collapsed when
    // the map loads and then the user is able to collapse it once used
    // this function specifically handles the expansion/collapse state of the elevationProfile widget

    expandElevation.watch("expanded", function (isExpanded) {
        if (!isExpanded) {
            elevationProfile.visible = false;
        } else {
            elevationProfile.visible = true;
        }
    });

    // Home Widget 

    let homeWidget = new Home({
        view: view,
    });

    view.ui.add(homeWidget, "top-left");


    // Legend Widget 

    const legendWidget = new Legend({
        view: view
    });

    const expandLegend = new Expand({
        view: view,
        content: legendWidget,
        expandIcon: "legend",
        expanded: false
    });

    view.ui.add(expandLegend, "bottom-left");

    // function implemented to ensure that the widget is collapsed when
    // the map loads and then the user is able to collapse it once used
    // this function specifically handles the expansion/collapse state of the legend widget

    expandLegend.watch("expanded", function (isExpanded) {
        if (!isExpanded) {
            legendWidget.visible = false;
        } else {
            legendWidget.visible = true;
        }
    });

    // Line of Sight Widget

    const lineOfSight = new LineOfSight({
        view: view
    });

    const expandLOS = new Expand({
        view: view,
        content: lineOfSight,
        expandIcon: "line-of-sight",
        expanded: false
    });

    view.ui.add(expandLOS, "bottom-left");

    // function implemented to ensure that the widget is collapsed when
    // the map loads and then the user is able to collapse it once used
    // this function specifically handles the expansion/collapse state of the line of sight widget

    expandLOS.watch("expanded", function (isExpanded) {
        if (!isExpanded) {
            lineOfSight.destroy();
        }
    });


    //========================================
    // Feature Layer and Symbology Section 
    //========================================

    //Symbology for the park-polygon layer is edited 

    let parksrenderer = {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: "green",
            outline: {
                width: 2,
                color: "green"
            }
        }
    };

    // Pop-ups for the parks configured, pop-up
    // shows the name of the park and its area 

    let parksPopup = {
        title: "Park Names",
        content: [{
            type: "fields",
            fieldInfos: [
                {
                    fieldName: "AREA_NA9",
                    label: "Park Name"
                },
                {
                    fieldName: "Area_SH7",
                    label: "Park Area",
                    format: {
                        digitSeparator: true,
                        places: 2
                    }
                }
            ]
        }]
    };

    let parksTO = new FeatureLayer({
        url: "https://services7.arcgis.com/df6AWIvUhm1UXFiR/arcgis/rest/services/Green_Spaces___4326/FeatureServer",
        popupTemplate: parksPopup,
        renderer: parksrenderer,
        copyright: "Shreya Kapoor"
    });

    // 3-D symbology used for the bike-rack layer 

    const bikeSymbol = new WebStyleSymbol({
        name: "City_Bike",
        styleName: "EsriRealisticTransportationStyle"
    });

    const bikeTORenderer = {
        type: "simple",
        symbol: bikeSymbol
    };

    let bikeTO = new FeatureLayer({
        url: "https://services7.arcgis.com/df6AWIvUhm1UXFiR/arcgis/rest/services/Bike_single/FeatureServer",
        renderer: bikeTORenderer
    });

    //  customize bike symbol appearance(size) and apply modified symbol to the bikeTO layer

    bikeSymbol.fetchSymbol()
        .then(function (bikeSym) {
            const objectSymbolLayer = bikeSym.symbolLayers.getItemAt(0);
            objectSymbolLayer.material = { color: "black" };
            objectSymbolLayer.height *= 100;
            objectSymbolLayer.width *= 100;
            objectSymbolLayer.depth *= 150;

            const NEWrenderer = bikeTO.renderer.clone();
            NEWrenderer.symbol = bikeSym;
            bikeTO.renderer = NEWrenderer;
        });


    // command that allows for adding the feature layers to the map/ scene
    mainMap.addMany([
        parksTO,
        bikeTO
    ]);
});
