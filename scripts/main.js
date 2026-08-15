/*
Program: main.js 
Programmer: Shreya Kapoor 
Purpose: To create a 3D Map to view trees and parks within the City of Toronto 
*/

"use strict";

require(["esri/config",
    "esri/Map",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/WebStyleSymbol",
    "esri/layers/GeoJSONLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    //add widget modules 
    "esri/widgets/BasemapToggle",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/ElevationProfile",
    "esri/widgets/LineOfSight",
    "esri/widgets/Expand"


], function (esriConfig, Map, SceneView, Graphic, SimpleRenderer,
    WebStyleSymbol, GeoJSONLayer,
    MapImageLayer, FeatureLayer,
    BasemapToggle, Legend, Home, ElevationProfile, LineOfSight, Expand) {

    // give access via API token 
    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurPWYmO6Vumzeg8ratTVagTwXqrSv6APntacQRXJKSm-WvXRfQeKEWPMZ6oI9_dgfr2tyUK1fzVqvXS-YUqbE7uXfTjAVun1sG_hN4wf1gVl5G2an5E7jTxgWUHWJNhmJOKYYtJtbkcKWzzTH0UZDair9W7w4Vwsn4HhUp8DbYGEBQrwaAePQwrSCNW0nk0SpJ1bXGxMgTiW7rLUTUC0MRi8.AT1_HJgtVt3g"

    // define map
    const mainMap = new Map({
        basemap: "streets",
        ground: "world-elevation"
    });

    // define map view 
    const view = new SceneView({
        map: mainMap,
        container: "viewDiv",
        camera: {
            position: [
                -78.75,
                43.55,
                50000
            ],
            heading: 300,
            tilt: 45
        }
    });

    // BaseMap Toggle Widget 
    let basemapWidget = new BasemapToggle({
        view: view,
        nextBasemap: "satellite"

    });

    // Adding the widget to the top right of the map 

    view.ui.add(basemapWidget, "top-right");


    // Home Widget 

    let homeWidget = new Home({
        view: view,

    });

    view.ui.add(homeWidget, "top-left");

    // create the legend widget
    const legendWidget = new Legend({
        view: view
    });

    // wrap it in an Expand widget
    const expandLegend = new Expand({
        view: view,
        content: legendWidget,
        expandIcon: "legend",
        expanded: false
    });

    // add it to the map
    view.ui.add(expandLegend, "bottom-left");

    // create an event listener so the widget can be expanded or collapsed
    // once used/ viewed. Similar functions are created for the Elevation profile
    // and Line of Sight widgets as well. 

    expandLegend.watch("expanded", function (isExpanded) {
        if (!isExpanded) {
            legendWidget.visible = false;
        } else {
            legendWidget.visible = true;
        }
    });

    // add elevation profile 3D widget 
    const elevationProfile = new ElevationProfile({
        view: view
    });

    // wrap elevationProfile in Expand widget
    const expandElevation = new Expand({
        view: view,
        content: elevationProfile,
        expandIcon: "graph-area", // optional: change icon if you'd like
        expanded: false
    });

    // adds the ElevationProfile to the top right corner of the view
    view.ui.add(expandElevation, "bottom-left");


    expandElevation.watch("expanded", function (isExpanded) {
        if (!isExpanded) {
            elevationProfile.visible = false;
        } else {
            elevationProfile.visible = true;
        }
    });

    // LineofSight Widget 

    const lineOfSight = new LineOfSight({
        view: view
    });

    // Wrap it in an Expand widget (starts collapsed)
    const expandLOS = new Expand({
        view: view,
        content: lineOfSight,
        expandIcon: "line-of-sight", 
        expanded: false
    });

    // Add the Expand widget to the bottom-left of the map
    view.ui.add(expandLOS, "bottom-left");

    // Handle collapse behavior
    expandLOS.watch("expanded", function (isExpanded) {
        if (!isExpanded) {
            lineOfSight.destroy();
        }
    });




    // layers for City of Toronto trees and parks were uploaded om
    // ArcGIS Location Platform portal 


    // Symbology for the parks layer 
    let parksrenderer = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: "green",
            outline: {  // autocasts as new SimpleLineSymbol()
                width: 2,
                color: "green"
            }
        }
    };

    // Pop up created for the parks/ polygon layer 
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

    // hosting the parks polygon layer data 
    let parksTO = new FeatureLayer({
        url: "https://services7.arcgis.com/df6AWIvUhm1UXFiR/arcgis/rest/services/Green_Spaces___4326/FeatureServer"
        , popupTemplate: parksPopup
        , renderer: parksrenderer
        ,copyright: "Shreya Kapoor"
    });

    // // adding 3D symbol for trees (point features)

    const treeSymbol = new WebStyleSymbol({
        name: "Pinus",
        styleName: "EsriRealisticTreesStyle"
    });

    const treesTORenderer = {
        type: "simple",
        symbol: treeSymbol
    };

    let treeTO = new GeoJSONLayer({
        url: "./GeoJSON/Tree.geojson"
        , copyright: "Shreya Kapoor"
        , renderer: treesTORenderer

    });


    // resizing the trees 

    treeSymbol.fetchSymbol()
        .then(function (treeSym) {
            const objectSymbolLayer = treeSym.symbolLayers.getItemAt(0);
            objectSymbolLayer.material = { color: "green" };
            objectSymbolLayer.height *= 10;
            objectSymbolLayer.width *= 20;
            objectSymbolLayer.depth *= 20;

            const NEWrenderer = treeTO.renderer.clone();
            NEWrenderer.symbol = treeSym;
            treeTO.renderer = NEWrenderer;
        });


    mainMap.addMany([
        parksTO,
        treeTO
    ]);

});