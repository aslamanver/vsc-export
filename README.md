# VSC Extension Export & Import | VSC-Export

[![Build Status](https://travis-ci.org/aslamanver/vsc-export.svg?branch=master)](https://travis-ci.org/aslamanver/vsc-export)

This extension helps you to export all of your extensions installed in VS Code in a simple text file named `vsc-extensions.txt` into your project folder, more than that you can import all the extensions with the latest updated version of the text file `vsc-extensions.txt` using this same extension again when you need it.

Amazing right? 
You can now don't want to host your source code project into Git without the extensions. No worries, just push the `vsc-extensions.txt` file along with your project so when you pull it there is a single command to get all the extensions back to your system.

[![Export](https://raw.githubusercontent.com/aslamanver/vsc-export/master/resources/screenexport.gif)](https://raw.githubusercontent.com/aslamanver/vsc-export/master/resources/screenexport.gif)

[![Import](https://raw.githubusercontent.com/aslamanver/vsc-export/master/resources/screenimport.gif)](https://raw.githubusercontent.com/aslamanver/vsc-export/master/resources/screenimport.gif)

## Requirements

Latest VS Code installed in your system and the `code` variable is added into your environment path

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=aslamanver.vsc-export).

Alternatively, open Visual Studio code, press `Ctrl + P` or `Cmd + P` and type:

    > ext install aslamanver.vsc-export

*Note: Your star to the GitHub repository matters a lot for this contributor, see you there.*

## Instructions

### To Export Extensions

* Run command palette `Ctrl + Shift + P`
* Type `VSC Export`

> A text file named <b>vsc-extensions.txt</b> will be created in your project folder which contains all of the exported extensions names.

### To Import Extensions

* Run command palette `Ctrl + Shift + P`
* Type `VSC Import`

> You should have the <b>vsc-extensions.txt</b> file in your project folder, when you run the import command you can see the importing report while it's processing.

That's it check your importing report for more information.

## Known Issues

Nothing for now.

## TODO

- [ ] Microsoft Sync process implementation

### Source Code

The source code is available on GitHub [here](https://github.com/aslamanver/vsc-export).

**Give your support by rate this project on GitHub and VSCode**
