/*
Program: main.js 
Programmer: Shreya Kapoor 
Purpose: To create a 3D Map to view parks and bike racks within the City of Toronto 
Includes UI widgets for toggling basemaps, viewing elevation profiles, and line of sight.
*/

"use strict";

require([
    "esri/config",
    "esri/Map",
    "esri/views/SceneView",
    "esri/symbols/WebStyleSymbol",
    "esri/layers/GeoJSONLayer",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/ElevationProfile",
    "esri/widgets/LineOfSight",
    "esri/widgets/Expand"

], function (esriConfig, Map, SceneView,
    WebStyleSymbol,
    GeoJSONLayer,
    BasemapToggle, Legend, Home, ElevationProfile, LineOfSight, Expand) {

    esriConfig.apiKey = "AAPTaV8XoYcyMx3XGYCgyIEnz3Q..cXkk1q5Dm-7xeGgmoMhi6kpw1pbLUP9rAtDI06tsHMCmZ1C84Z87Ki8C7a-ucU88YIvGx3qIei-2cqJMM7Iwq3qp3KiRXBPf5WG59k5PnKDTN7YHWvpBRzmGbfEvZ2xMnmKzUnEcJhHYPTFteGyIYGJH07X2usHhO_4Njn1gM38dE0FXpm0NYZKRDCKAdi5xpd19CO0d8XxF2CHHyoy-pW57rIGVGpFNwwTZsIoaRIwcPV2Vs_aZRbxTc-4.AT1_bxrQ3Qvz"

    const mainMap = new Map({
        basemap: "streets",
        ground: "world-elevation"
    });

    const view = new SceneView({
        map: mainMap,
        container: "viewDiv",
        camera: {
            position: [-78.83, 43.55, 50000],
            heading: 300,
            tilt: 45
        }
    });

    let basemapWidget = new BasemapToggle({ view: view, nextBasemap: "satellite" });
    view.ui.add(basemapWidget, "top-right");

    const elevationProfile = new ElevationProfile({ view: view });
    const expandElevation = new Expand({ view: view, content: elevationProfile, expanded: false });
    view.ui.add(expandElevation, "bottom-left");
    expandElevation.watch("expanded", (isExpanded) => { elevationProfile.visible = isExpanded; });

    let homeWidget = new Home({ view: view });
    view.ui.add(homeWidget, "top-left");

    const legendWidget = new Legend({ view: view });
    const expandLegend = new Expand({ view: view, content: legendWidget, expandIcon: "legend", expanded: false });
    view.ui.add(expandLegend, "bottom-left");
    expandLegend.watch("expanded", (isExpanded) => { legendWidget.visible = isExpanded; });

    const lineOfSight = new LineOfSight({ view: view });
    const expandLOS = new Expand({ view: view, content: lineOfSight, expandIcon: "line-of-sight", expanded: false });
    view.ui.add(expandLOS, "bottom-left");
    expandLOS.watch("expanded", (isExpanded) => { if (!isExpanded) lineOfSight.destroy(); });

    //========================================
    // Parks Layer (local GeoJSON)
    //========================================

    let parksrenderer = {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: "green",
            outline: { width: 2, color: "green" }
        }
    };

    let parksPopup = {
        title: "Park Names",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "AREA_NA9", label: "Park Name" },
                { fieldName: "AREA_SH7", label: "Park Area" }
            ]
        }]
    };

    let parksTO = new GeoJSONLayer({
        url: "./GeoJSON/Green_Spaces___4326.geojson",
        popupTemplate: parksPopup,
        renderer: parksrenderer,
        copyright: "Shreya Kapoor"
    });

    //========================================
    // Bike Racks Layer (local GeoJSON)
    //========================================

    const bikeSymbol = new WebStyleSymbol({
        name: "City_Bike",
        styleName: "EsriRealisticTransportationStyle"
    });

    const bikeTORenderer = {
        type: "simple",
        symbol: bikeSymbol
    };

    let bikeTO = new GeoJSONLayer({
        url: "./GeoJSON/Bicycle.geojson",
        renderer: bikeTORenderer
    });

    bikeSymbol.fetchSymbol()
        .then(function (bikeSym) {
            const objectSymbolLayer = bikeSym.symbolLayers.getItemAt(0);
            objectSymbolLayer.material = { color: "black" };
            objectSymbolLayer.height *= 10;
            objectSymbolLayer.width *= 10;
            objectSymbolLayer.depth *= 15;

            const NEWrenderer = bikeTO.renderer.clone();
            NEWrenderer.symbol = bikeSym;
            bikeTO.renderer = NEWrenderer;
        });

    mainMap.addMany([parksTO, bikeTO]);
});