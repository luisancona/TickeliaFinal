sap.ui.define(["../lib/xlsx",
		"../lib/jszip",
		"sap/m/MessageBox",
      'jquery.sap.global',
      'sap/ui/core/mvc/Controller',
      'sap/ui/model/Filter',
      'sap/ui/model/json/JSONModel',
      'sap/m/Column',
      'sap/m/ColumnListItem',
      'sap/m/Label',
      'sap/m/Text'		
	],
	function (xlsx, jszip, MessageBox,jQuery, Controller, Filter, JSONModel, Column, ColumnListItem, Label, Text) {
		"use strict";
		return {
			headerAdjust: function (headerRow){
				//var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";
				for (var i = 0; i < headerRow.length; i ++){
					headerRow[i] = headerRow[i].split(" ").join("");
					headerRow[i] = headerRow[i].split("-").join("");
					headerRow[i] = headerRow[i].split(".").join("");
					//headerRow[i] = headerRow[i].replace(new RegExp("\\" + specialChars[i], "gi"), "");
					if  (i == 74 ) {
						headerRow[i] = "Fechavto";
					}
				}	
				return headerRow;
			},
			readExtension: function (name) {
				var extension = name.split(".").pop().toLowerCase();
				return extension;
			},
			readXLXfile: function (oEvent) {
				//if (file && window.FileReader) {
				//	var reader = new FileReader();
				var result = {};
				var data;
				//	reader.onload = function (e) {
				data = oEvent.target.result;
				var wb = xlsx.XLSX.read(data, {
					type: 'binary'
				});
				wb.SheetNames
					.forEach(function (sheetName) {
						var roa = xlsx.XLSX.utils
							.sheet_to_row_object_array(wb.Sheets[sheetName]);
						if (roa.length > 0) {
							result[sheetName] = roa;
						}
					});

				//reader.readAsBinaryString(file);
				//}
			},
			readCSVfile: function (oEvent, idTable, oTable) {
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
				//var jsonData = oModel.getJSON(); //Obtiene el JSON
				//MessageBox.show(jsonData);
				var oStringResult = JSON.stringify(data);
				var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
				//return result; //JavaScript object
				//var idProperty = "/" ;
				//idProperty = idProperty.concat(idTable);
				//sap.ui.getCore().getModel().setProperty( idProperty, oFinalResult);
				//this.generateTable(idTable, oTable, idProperty,headerRow , oFinalResult);
				return [headerRow, oFinalResult];

			},
			generateTable: function (idTable, oTable, oModel, idProperty, headerRow, oFinalResult, oModelData) {
				//var oTable = this.getView().byId(idTable);
				//var oModel = sap.ui.getCore().getModel();
				//var oModelData = oModel.getProperty(idProperty);
				var oColumns = Object.keys(oModelData[0]);
				var oColumnNames = [];
				$.each(oColumns, function (i, value) {
					oColumnNames.push({
						Text: oColumns[i]
					});
				});
				oModel.setProperty("/columnNames", oColumnNames);
				var oTemplate = new Column({
					header: new Label({
						text: "{Text}"
					})
				});
				oTable.bindAggregation("columns", "/columnNames", oTemplate);
				var oItemTemplate = new ColumnListItem();
				var oTableHeaders = oTable.getColumns();
				$.each(oTableHeaders, function (j, value) {
					var oHeaderName = oTableHeaders[j].getHeader().getText();
					oItemTemplate.addCell(new Text({
						text: "{" + oHeaderName + "}"
					}));
				});
				oTable.bindItems(idProperty, oItemTemplate);
			}
		};

	});