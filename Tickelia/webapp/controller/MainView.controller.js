// @ts-ignore
sap.ui.define([
	'sap/m/MessageToast',
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
    "../util/util",
//   "../lib/xlsx",
    "sap/ui/core/routing/History",
    'jquery.sap.global',   
//   "sap/ui/thirdparty/jquery",
    'sap/ui/core/util/Export',
    "sap/ui/core/util/ExportType",
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library'
// @ts-ignore
], function (MessageToast, Controller, JSONModel, Filter, FilterOperator, 
        MessageBox, util, History, jQuery, 
        Export, ExportType,
        ExportTypeCSV, 
        Spreadsheet,
        exportLibrary ) {
	"use strict";

	return Controller.extend("NSTickelia.Tickelia.controller.MainView", {
		onInit: function () {
			var oView = this.getView();
			// set explored app's demo model on this sample
			//var oJSONModel = this.initSampleDataModel();
			//oView.setModel(oJSONModel);
			oView.setModel(new JSONModel({
				globalFilter: "",
				availabilityFilterOn: false,
				cellFilterOn: false
			}), "ui");
			// @ts-ignore
			var oModelST = new sap.ui.model.json.JSONModel("model/fileStructure.json");
			this.getView().setModel(oModelST, "structureFile", false);
			// @ts-ignore
			var oModelCN = new sap.ui.model.json.JSONModel("model/constants.json");
			this.getView().setModel(oModelCN, "constants", false);
			// @ts-ignore
			var oUploader = this.getView().byId("fileUploader");
			/*			// Ver 1
						var oModel3 = new sap.ui.model.json.JSONModel();
							oModel3.loadData("../model/fileStructure.json", false);
							oView.setModel(oModel3, "fileStructure");*/
			// get the path to the JSON file
			/*			// Ver 2
						var sPath = jQuery.sap.getModulePath("NSTickelia.Tickelia", "model/fileStructure.json");
						// initialize the model with the JSON file
						var oModel = new JSONModel(sPath);
						// set the model to the view
						this.getView().setModel(oModel, "structureFile");*/

			//		var jsonTemplate = new JSONModel(jQuery.sap.getModulePath("webapp/model", "fileStructure.json"));
			//		oView.setmodel("/fileStructure", jsonTemplate);

			/*	var oModel = new sap.ui.model.json.JSONModel();
				oModel.setSizeLimit(10000);
				sap.ui.getCore().setModel(oModel);*/

		},
		handleUploadComplete: function (oEvent) {
			//util.readCSVfile(oEvent);
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},

		handleUploadPress: function () {
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.upload();
		},

		// @ts-ignore
		OnAttachUploadCSV: function (oEventMain) {
			//			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var fU = this.getView().byId("AttachUploader");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];
			var name = domRef.files[0].name;
			var extension = util.readExtension(name);
			var reader = new FileReader();
			var idTable = "idOrigDataTable";
			var idProperty = "/";
			var oTableCSV = this.getView().byId(idTable);
			//var oModelST = this.getView().getModel("structureFile");
			idProperty = idProperty.concat(idTable);
			//var oTable = this.getView().byId(idTable);
			//var params = "dataInput";

			reader.onload = function (oEvent) {
				switch (extension) {
				case "csv":

					var backData = that.readCSVfile(oEvent, idTable, oTableCSV);

					//				    var oModelData = oModel.getProperty(idProperty);
					//var backData = util.generateTable(idTable, oTable, idProperty, oModelData);
					var headerRow = backData[0];
					var oFinalResult = backData[1];
					//sap.ui.getCore().getModel().setProperty("/", oFinalResult); otra version.
                    // @ts-ignore
                    var oModel = new sap.ui.model.json.JSONModel(oFinalResult);
					oTableCSV.setModel(oModel);
					that.getView().setModel(oFinalResult, "OriginalData", false);
					//var oTable = this.getView().byId(idTable);
					//for (var i = 0; i < headerRow.length; i += 1) {
					for (var i = 0; i < headerRow.length; i += 1) {
						// @ts-ignore
						var oColumn = new sap.m.Column("col" + i, {
							//var oColumn = new sap.m.Column(headerRow[i], {
							//var oColumn = new sap.m.Column("col" + i, {
							width: "100px",
							/*	filterProperty: headerRow[i],
								sortProperty: headerRow[i],*/
							// @ts-ignore
							header: new sap.m.Label({
								text: headerRow[i]
							})

						});
						oTableCSV.addColumn(oColumn);
					}
					var oCell = [];
					for (i = 0; i < headerRow.length; i++) {
						//if (i === 0) {
						// @ts-ignore
						var cell1 = new sap.m.Text({
							text: "{" + headerRow[i] + "}",
							wrapping: false
						});
						/*var cell1 = new sap.m.Input({
								value: "{" + headerRow[i] + "}"
							});
							//}*/
						oCell.push(cell1);
					}
					/*	var oCell = []; 
						for (i = 0; i < headerRow.length; i++) { 
							if (i === 0) { 
								var cell1 = new sap.m.Text({ text: "{QuestionTx}" }); 
							} 
							oCell.push(cell1); }*/
					// @ts-ignore
					var aColList = new sap.m.ColumnListItem("aColList", {
						cells: oCell
					});
                    oTableCSV.bindItems("/", aColList);
					//				    util.generateTable(idTable, oTable, oModel, idProperty,headerRow , oFinalResult);
					/*						
										var strCSV = oEvent.target.result;
										//var arrCSV = strCSV.match(/[\-\_\u00C0-\u017F\w .]+(?=,?)/g);
										//var csvAsArray = strCSV.match(/[\-\_\u00C0-\u017F\w .]+(?=;?)/g);
										//var csvV2 = strCSV.replace(/['",]/g, '').split(/[↵\n]+/).join(';').split(';')
										var arrCSV = strCSV.replace(/['"]/g, '').split(/[↵\n]+/).join(';').split(';');
										var noOfCols = 75;
										//var headerRowArray = csvAsArray.splice(0, noOfCols);
										//var headerRowV2 = csvV2.splice(0, noOfCols); 
										var headerRow = arrCSV.splice(0, noOfCols);
										
										var data = [];
										while (arrCSV.length > 0) {
											var obj = {};
											var row = arrCSV.splice(0, noOfCols);
											for (var i = 0; i < row.length; i++) {
												obj[headerRow[i]] = row[i].trim();
											}
											data.push(obj);
										}
										var oModel = new sap.ui.model.json.JSONModel();
										oModel.setData(data);
										var jsonData = oModel.getJSON();
										MessageBox.show(jsonData);
										
										//oTable.setModel(oModel.setData(data));
					/*					var Len = data.length;
										data.reverse();
										params += "[";
										for (var j = 0; j < Len; j++) {
											params += JSON.stringify(data.pop()) + ", ";
										}
										params = params.substring(0, params.length - 2);
										params += "]";
										//MessageBox.show(params);
										var http = new XMLHttpRequest();
										var url = oResourceBundle.getText("dataInput").toString();
										http.onreadystatechange = function () {
											if (http.readyState === 4 && http.status === 200) {
												var json = JSON.parse(http.responseText);
												var status = json.status.toString();
												switch (status) {
												case "Success":
													MessageToast.show("Data is uploaded succesfully.");
													break;
												default:
													MessageToast.show("Data was not uploaded.");
												}
											}
										};
										http.open("POST", url, true);
										http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
										http.send(params);*/
					break;
				case "xlsx":
					//params = "";
					break;
				}
			};
			reader.onerror = function (event) {
				MessageBox.show("File could not be read! Code " + event.target.error.code);
			};
			reader.readAsBinaryString(file);
		},

		// @ts-ignore
		OnAttachUploadXLS: function (oEventMain) {
			// @ts-ignore
			var constants = this.getConstants();
			// @ts-ignore
			var that = this;
			var fU = this.getView().byId("AttachUploader");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];
			var name = domRef.files[0].name;
			var extension = util.readExtension(name);
			var reader = new FileReader();
			reader.onload = function (oEvent) {
				if (extension === "xls" ||
					extension === "xlsx") {
					util.readXLXfile(oEvent);
				}
			};
			reader.onerror = function (event) {
				MessageBox.show("File could not be read! Code " + event.target.error.code);
			};
			reader.readAsBinaryString(file);
		},
		// @ts-ignore
		readCSVfile: function (oEvent, idTable, oTable) {
			//var acentos = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'};
			var strCSV = oEvent.target.result;
			//var arrCSV = strCSV.match(/[\-\_\u00C0-\u017F\w .]+(?=,?)/g);
			//var csvAsArray = strCSV.match(/[\-\_\u00C0-\u017F\w .]+(?=;?)/g);
			//var csvV2 = strCSV.replace(/['",]/g, '').split(/[↵\n]+/).join(';').split(';')
			//var withoutAcutes = strCSV.split('').map( letra => acentos[letra] || letra).join('').toString();	
			var temporal = strCSV.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
			strCSV = temporal;
			var arrCSV = strCSV.replace(/['"]/g, '').split(/[↵\n]+/).join(';').split(';');
			var noOfCols = 75;
			//var headerRowArray = csvAsArray.splice(0, noOfCols);
			//var headerRowV2 = csvV2.splice(0, noOfCols); 
			var headerRow = arrCSV.splice(0, noOfCols);
			headerRow = util.headerAdjust(headerRow);

			var data = [];
			while (arrCSV.length > 0) {
				var obj = {};
				var row = arrCSV.splice(0, noOfCols);
				for (var i = 0; i < row.length; i++) {
					obj[headerRow[i]] = row[i].trim();
				}
				data.push(obj);
			}

			// @ts-ignore
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);
			//var jsonData = oModel.getJSON(); //Obtiene el JSON
			//MessageBox.show(jsonData);
			var oStringResult = JSON.stringify(data);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			//return result; //JavaScript object
			//var idProperty = "/" ;
			//idProperty = idProperty.concat(idTable);
			//sap.ui.getCore().getModel().setProperty( idProperty, oFinalResult);
			//this.generateTable(idTable, oTable, idProperty,headerRow , oFinalResult);
			//sap.ui.getCore().getModel().setProperty("/", oFinalResult);
			return [headerRow, oFinalResult];

		},

		OnProcessFile: function () {
            // @ts-ignore
            this.getView().byId("panel1").setExpanded(false);
			var constants = this.getConstants();
			var strutureFile = this.getStructureFile();
			var originalData = this.getOriginalData();
			var headerST = strutureFile["structures"]["Header"];
            // @ts-ignore
            var itemST = strutureFile["structures"]["Item"];
            var rowST = this.JsontoArray(strutureFile["structures"]["rows"]);
            var idTable = "idProcDT";
            var numDocumento = 0;
            //var oBukrs = this.getView().byId("IDBukrs");
            //var tBukrs = oBukrs.getValue();
            var bukrs = this.getView().byId("IDBukrs").getValue();
            if (bukrs === "") {
                var sMsg = "Input cannot be empty, please enter an Input"; 
                MessageToast.show(sMsg);
                }
            else {
                if (originalData != "") {
                    // @ts-ignore
                    var jsonData = [];
                    for (var numRegistro in originalData) {
                        if (numRegistro != "") {
                            // @ts-ignore
                            numDocumento += 1;
                            var jsonH1 = this.CreateHeaderH1(numDocumento, rowST);
                            jsonData.push(jsonH1);
                            var jsonH2= this.CreateHeaderH2( headerST, rowST);
                            jsonData.push(jsonH2);
                            var jsonH1 = this.CreateHeaderH3(originalData[numRegistro], rowST, bukrs);
                            jsonData.push(jsonH1); 
                            var jsonI1 = this.CreateItemI1(numDocumento, rowST);
                            jsonData.push(jsonI1);                                               
                            var jsonI2 = this.CreateHeaderH2(itemST, rowST);
                            jsonData.push(jsonI2);     
                            var jsonI3C = this.CreateItemI2(originalData[numRegistro], rowST, bukrs, "Debit");
                            jsonData.push(jsonI3C);    
                            var jsonI3D = this.CreateItemI2(originalData[numRegistro], rowST, bukrs, "Credit");
                            jsonData.push(jsonI3D);                                                        
                            
                        }
                    }
                    
                }

                this.LoadDatatoTable( jsonData, rowST, idTable, "processedData", this);
             }
		},
		getConstants: function () {
			var oModelSF = this.getView().getModel("structureFile");
			var structureFile = oModelSF.getData();
			return structureFile;
		},
		getStructureFile: function () {
			var oModelCT = this.getView().getModel("structureFile");
			var constants = oModelCT.getData();
			return constants;
		},
		getOriginalData: function () {
			var OriginalData = this.getView().getModel("OriginalData");
			return OriginalData;
		},
        // @ts-ignore
        CreateHeaderH1: function (numDocumento,rowST) {
            var fieldsRow = Object.keys(rowST);
            var jsonHeader = {};
            var jsonData = [];
            for (var index = 0; index < fieldsRow.length; ++index) {
                var field = rowST[index];
                var labelHeader = this.getView().getModel("i18n").getResourceBundle().getText("headerDocumentText");
                switch(index){
                    case 0:
                        jsonHeader[field] = numDocumento;
                        break;
                    case 1:
                        jsonHeader[field] = labelHeader;
                        break;
                    default:
                        jsonHeader[field] = "";
                        break;
                }
            }
            return jsonHeader;
        },
		CreateHeaderH2: function ( headerST,rowST ) {

			var fieldsHeader = Object.keys(headerST);
            var fieldsRow = Object.keys(rowST);
            var jsonHeader = {};
            var jsonData = [];

			for (var index = 0; index < fieldsRow.length; ++index)  {
                var field = rowST[index];
                if ( headerST[fieldsHeader[index]] != "") { 
				    jsonHeader[field] = headerST[fieldsHeader[index]];
                }
                else {
                    jsonHeader[field] = "";
                }
            }
            jsonData.push(jsonHeader);
			return jsonHeader;
        },
        
        CreateHeaderH3: function (originalData,  rowST, bukrs) {

            var fieldsRow = Object.keys(rowST);
            var jsonHeader = {};
            var jsonData = [];
            for (var index = 0; index < fieldsRow.length; ++index) {
                var field = rowST[index];
                switch(index){
                    case 1:
                        jsonHeader[field] = bukrs;
                        break;
                    case 2:
                        jsonHeader[field] = "AB";
                        break;
                    case 3:
                        jsonHeader[field] = originalData["Fecha"];
                        break;
                    case 4:
                        jsonHeader[field] = originalData["Fecha"];
                        break;
                    case 5:
                        jsonHeader[field] = "";
                        break;
                    case 6:
                        jsonHeader[field] = originalData["Informe"];
                        break;
                    case 7:
                        jsonHeader[field] = originalData["Moneda_Base"];
                        break;  
                    case 11:
                        jsonHeader[field] = originalData["Num_Factura"];
                        break;                              
                    default:
                        jsonHeader[field] = "";
                        break
                }
            }
            jsonData.push(jsonHeader);
            return jsonHeader;
        },
        // @ts-ignore
        CreateItemI1: function (numDocumento, rowST) {
            var fieldsRow = Object.keys(rowST);
            var jsonItem = {};
            var jsonData = [];
            for (var index = 0; index < fieldsRow.length; ++index) {
                var field = rowST[index];
                var labelItem = this.getView().getModel("i18n").getResourceBundle().getText("itemDocumentText");
                switch (index) {
                    case 0:
                        jsonItem[field] = "";
                        break;
                    case 1:
                        jsonItem[field] = labelItem;
                        break;
                    default:
                        jsonItem[field] = "";
                        break;
                }
            }
            return jsonItem;
        },
        CreateItemI2: function (originalData, rowST, bukrs, operation) {
            var fieldsRow = Object.keys(rowST);
            var jsonHeader = {};
            var jsonData = [];
            for (var index = 0; index < fieldsRow.length; ++index) {
                var field = rowST[index];
                switch (index) {
                    case 1:
                        jsonHeader[field] = bukrs;
                        break;
                    case 2:
                        switch (operation){
                            case "Debit":
                                jsonHeader[field] = originalData["Cuenta_Contable"];
                                break;
                            case "Credit":
                                jsonHeader[field] = originalData["Codigo_Traspaso"];;
                                break;    
                        }                        
                        break;
                    case 3:
                        jsonHeader[field] = originalData["Informe"];
                        break;
                    case 4:
                        if (operation === "Debit") {
                            jsonHeader[field] = originalData["Base_Imponible1"];
                        }
                        break;
                    case 5:
                        if (operation === "Credit"){
                            jsonHeader[field] =  originalData["Base_Imponible1"];

                        }
                        break;
                    case 10:
                        jsonHeader[field] = originalData["id_CeCo"];
                        break;
                    case 7:
                        jsonHeader[field] = "";
                        break;
                    case 11:
                        jsonHeader[field] = "";
                        break;
                    default:
                        jsonHeader[field] = "";
                        break
                }
            }
            jsonData.push(jsonHeader);
            return jsonHeader;            
        },
        JsontoArray: function (jsonData) {
            var arrayData = [];
            var keys = Object.keys(jsonData);
            keys.forEach(function (key) {
                arrayData.push(jsonData[key]);
            });
            return arrayData; 
        },

        LoadDatatoTable: function (dataTable, fieldStructure, idTable, oGlobalModel, globalThis){
            // @ts-ignore
            var idProperty = "/";
            //Get TABLE ID
            var oTable = globalThis.getView().byId(idTable);
            // @ts-ignore
            var oTableItems = oTable.getItems();
            var oTableColumns = oTable.getColumns();
            var headerRow = fieldStructure;
            //DATA
            var oFinalResult = dataTable;
            //CONVERT DATA TO JSON AND ASSING TO TABLE
            // @ts-ignore
            var oModel = new sap.ui.model.json.JSONModel(oFinalResult);
            oTable.setModel(oModel);
            globalThis.getView().setModel(oFinalResult, oGlobalModel, false);
            if (oTableColumns.length === 0  ) {
                for (var i = 0; i < headerRow.length; i += 1) {
                    // @ts-ignore
                    var oColumn = new sap.m.Column(headerRow[i], { //"field" + i, {
                        width: "100px",
                        // @ts-ignore
                        header: new sap.m.Label({
                            text: headerRow[i]
                        })
                    });
                    oTable.addColumn(oColumn);
                }
                var oCell = [];
                for (i = 0; i < headerRow.length; i++) {
                    var textCell = "{" + headerRow[i] + "}";
                    // @ts-ignore
                    var cell1 = new sap.m.Text({
                        text: textCell,
                        wrapping: false
                    });
                    oCell.push(cell1);
                }
                // @ts-ignore
                var TableColList = new sap.m.ColumnListItem("TableColList", {
                    cells: oCell
                });
                oTable.bindItems("/", TableColList);
            }
        },

        TableisBound:function (oTable) {
            // @ts-ignore
            var dataTable = [];
            // @ts-ignore
            var cols = oTable.getColumns();
            /*
            for (var i = 0; i < oTable.getModel().oData.results.length; i++) {

                dataTable.push(oTable.getModel().oData.results[i].Name);

            }
            */
            //var headerTable = Object.keys(JSONModel.getData().d.results[1]);

        },
        // @ts-ignore
        onExcelDataExport: sap.m.Table.prototype.exportData || function (oEvent) {
            var oTable = this.getView().byId("idProcDT");
            var oModel = oTable.getModel();
            var oColumns = oTable.getColumns();
            var oExcelColumn = this.excelColumnSet(oColumns, "3");   
            debugger;
            var oExport = new sap.ui.core.util.Export({
                exportType: new sap.ui.core.util.ExportTypeCSV({
                    separatorChar: "\t",
                    mimeType: "application/vnd.ms-excel",
                    charset: "utf-8",
                    fileExtension: "xls"
                }),
                models: oModel,
                rows: { path: "/procDT" },
                columns: oExcelColumn,

            });

            //* download exported file

            oExport.saveFile().always(function () {

                this.destroy();

            });
            
        },
        // @ts-ignore
        onExcelDataExportV2: sap.m.Table.prototype.exportData || function (oEvent) {
            var oTable = this.getView().byId("idProcDT");
            var oModel = oTable.getModel();
            var oColumns = oTable.getColumns();
            var oExcelColumn = this.excelColumnSet(oColumns,"1");   
            debugger;
             // @ts-ignore
            var oExport = new sap.ui.core.util.Export({
                // @ts-ignore
                exportType: new sap.ui.core.util.ExportTypeCSV({
                    separatorChar: "\t",
                    mimeType: "application/vnd.ms-excel",
                    charset: "utf-8",
                    fileExtension: "xls"
                }),
                models: oModel,
                rows: {
                    path: "/procDT"
                },
                columns: oExcelColumn
            });
            //* download exported file
            oExport.saveFile().always(function () {
                this.destroy();
            });
        },   
        onExcelDataExportV3: function (oEvent) {
            var aCols, oRowBinding, oSettings, oSheet, oTable;
            debugger;
            if (!this._oTable) {
                this._oTable = this.byId('idProcDT');
            }

            oTable = this._oTable;
            var oColumns = oTable.getColumns();
            var aCols = this.excelColumnSet(oColumns, "2")
            var oModel = oTable.getModel();
            var oDataSource = oModel.getProperty('/');
            oSettings = {
                workbook: {
                    columns: aCols,
                //    hierarchyLevel: 'Level'
                },
                dataSource: oDataSource, 
                /*
                {
                    type: 'odata',
                    dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
                    serviceUrl: this._sServiceUrl,
                    headers: oModel.getHeaders ? oModel.getHeaders() : null,
                    count: oRowBinding.getLength ? oRowBinding.getLength() : null,
                    useBatch: true // Default for ODataModel V2
                },
                */
                fileName: 'Table export sample.xlsx',
                worker: true // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        
        },       
        excelColumnSet: function (oColumn,tipo){
            var columnExcel = [];
            oColumn.forEach(function (element){
                var cell = {};
                var template = {};
                var content = {};
                switch ( tipo ) { 
                    case "1":
                        cell["name"] = element["sId"];
                        cell["content"] = "{" + element["sId"] + "}";                        
                        break;
                    case "2":
                        cell['label'] = element["sId"];
                        cell['property'] = element["sId"];
                        break;
                    case "3":
                        cell['name'] = element["sId"];
                        //template['content'] = '{' + element["sId"] + '}';
                        content['path'] = element["sId"];
                        template['content'] = content;
                        cell['template'] = template;
                        break;    
                }
                columnExcel.push(cell);
            }
            );
            return columnExcel;

        },
		filterGlobally: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Category", FilterOperator.Contains, sQuery)
				], false);
			}
			this._filter();
		},
		_filter: function () {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("table").getBinding("rows").filter(oFilter, "Application");
		}        

	});
});
