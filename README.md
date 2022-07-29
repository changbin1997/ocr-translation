OCR 翻译（ocr-translation）是一个使用 Electron 开发的 OCR 文字识别 + 翻译的软件，也是我为了解决个人需求开发的软件。

软件本身并不完全具备 OCR 识别和翻译的功能，OCR 功能需要调用百度或腾讯提供的在线 OCR 识别服务，翻译也需要调用百度翻译。

软件没有内置 API 密钥信息，使用 OCR 功能需要填写百度或腾讯的 API 密钥信息，使用翻译功能需要填写百度翻译的 API 密钥信息。

下面是 API 申请地址：

* 百度 OCR API：[https://ai.baidu.com/tech/ocr_general](https://ai.baidu.com/tech/ocr_general)
* 腾讯 OCR API：[https://cloud.tencent.com/product/ocr-catalog](https://cloud.tencent.com/product/ocr-catalog)
* 百度翻译 API：[https://fanyi-api.baidu.com/](https://fanyi-api.baidu.com/)

百度和腾讯的 API 每月可以免费调用 1000 次，百度翻译 API 标准版每月可以免费翻译 50000 字。

上面的免费调用次数说明写于 2022 年 7 月 29 日，免费额度和收费情况可能随时会更改，一切以官网为准。

## 支持的功能

下面是支持的 API 功能：

* 百度通用文字识别 - 通用文字识别（标准版）
* 百度通用文字识别 - 通用文字识别（高精度版）
* 腾讯通用文字识别 - 通用印刷体识别（标准版）
* 腾讯通用文字识别 - 通用印刷体识别（高精度版）
* 腾讯通用文字识别 - 广告文字识别
* 腾讯通用文字识别 - 手写体识别
* 百度翻译

目前只支持百度和腾讯的 OCR 服务，如果后续发现有提供免费额度的 OCR 服务，我也会加进去。

## 使用说明

[Releases](https://github.com/changbin1997/ocr-translation/releases) 中提供了 Windows 安装包 `ocr-translation-win.exe` 和免安装的 `ocr-translation-win-portable.zip` ，安装包安装完成后在桌面会创建快捷方式，免安装的 zip 解压后找到 `ocr-translation.exe` 打开就可以使用。

如果没有填写任何 OCR API 密钥，进入 OCR 页面就会弹出对话框提示，您可以在设置中填写百度或腾讯的 OCR 密钥，如下：

![ocr-translation的设置页面](screenshot/options-page.jpg)

填写完成后就可以使用 OCR 识别了，OCR 识别页面如下：

![ocr-translation的OCR识别页面](screenshot/ocr-page.jpg)

右上方可以选择功能，点击左侧选择图片文件，也可以直接把图片文件拖到左侧识别，识别后的文本内容会显示在右侧，如下：

![ocr-translation识别结果](screenshot/ocr-result.jpg)

点击 **朗读** 可以朗读识别文本，语音在本地合成，无需等待，不限次数。

点击上方工具栏 **翻译** 会跳转到翻译页面，识别文本会自动传到原文输入框，点击语言选择区域的右箭头就可以直接翻译了。

你也可以从左侧的侧边栏进入翻译页面，手动输入内容翻译，如下：

![ocr-translation的翻译页面](screenshot/translation-page.jpg)

翻译页面的语音也是在本地合成的。

## 选择屏幕区域识别

除了选择图片识别外，你也可以通过快捷键来选择屏幕区域识别，在 **设置** 中开启 **启用 F1 全局快捷键** 或 **启用 F2 全局快捷键** ，在 F1 或 F2 快捷键功能中选择默认的功能，保存重启后按 F1 或 F2 会弹出类似截图的屏幕区域选择，用鼠标选择完区域后点击 **完成** 或按 **回车** 或 **空格** 就能识别屏幕区域。

点击 **翻译** 也可以直接跳转翻译。

软件最小化或在其它窗口也可以直接按 F1 或 F2 快捷键识别。

你还可以在设置的 **自动执行** 中启用 **OCR识别完成后自动翻译** 和 **翻译完成后自动朗读译文内容** ，只需要按 F1 或 F2 选择完屏幕区域后软件就能识别文字 -> 翻译 -> 自动朗读。

在玩游戏的时候遇到需要翻译的英文也只需要按下 F1 或 F2 选择完屏幕区域后无需切出去，软件就能自动朗读出中文。

## 使用统计

为了避免额度用完导致扣费，OCR翻译还提供了一个历史记录页面来查看使用统计，如下：

![ocr-translation的记录总览页面](screenshot/history-page.jpg)

你还可以查看更详细的 OCR 或翻译历史记录：

![ocr-translation的OCR历史记录表格](screenshot/table-page.jpg)

## 注意事项

语音合成功能需要你的电脑上安装了语音库才能使用，一般的 Windows 10 以上的系统都会有语音库，只有一些修改过的精简版或 GHOST 的系统才会删除语音库。

软件虽然是用 Electron 开发的，但在 Linux 和 Mac 并不能使用完整功能，软件的选择屏幕区域识别功能用到了微信截图的 dll，在 Linux 和 Mac 可能无法使用。

软件没有服务器，不会联网，只有 OCR 识别和翻译的时候会连接到百度或腾讯的服务器。软件的数据保存使用的是 SQLite 数据库，第一次进入软件后会在软件目录生成一个 `data.db` 的数据文件，软件设置和历史记录就保存在 `data.db` 中。