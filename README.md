# QIUSUO 求索

根据文件类型管理文件，提交文件分类收集和根据文件名搜索文件的功能。

![](https://github.com/kylqin/qiusuo/blob/master/assets/qiusuo.png?raw=true)

## 安装

```sh
npm install -g qiusuo
```

## 使用

### --help

```sh
qs -h
```

### 使用示例

根据配置文件中的 Section (通过 `--section=<section>` 或 `-s <section>` 指定) 执行搜索或收集任务(见<a href="#配置文件">配置文件</a>)。

```sh
qs -s books s 金庸                     # search books
qs --section=notes search mathematic   # search notes
qs -s books collect                    # collect downloaded books to your target directory
```

### Keyboard Map

QIUSUO 使用 Vim 风格的键盘映射。

| key | 功能 |
| - | - |
| `/` | 激活搜索框，按回车`<enter>`提交搜索 |
| `j` | 光标移动到下一项 |
| `k` | 光标移动到上一项 |
| `{n}j` | 光标移动到下 n 项, 其中 (`{n}` 代表一个数字如 4, 16) |
| `{n}k` | 光标移动到上 n 项, 其中 (`{n}` 代表一个数字如 4, 16) |
| `<C-j>` | 光标移动到下 15 项 |
| `<C-k>` | 光标移动到上 15 项 |
| `{n}<C-j>` | 光标移动到下 n * 15 项, 其中 (`{n}` 代表一个数字如 4, 16) |
| `{n}<C-k>` | 光标移动到上 n * 15 项, 其中 (`{n}` 代表一个数字如 4, 16) |
| `g` | 光标移动到第一项 |
| `G` | 光标移动到最后一项 |
| `q` | 退出 |

搜索框为激活状态时，有如下按键映射。

| key | 功能 |
| - | - |
| `<enter>` | 搜索 |
| `<C-g>` | 取消搜索 |
| `<C-u>` | 清空搜索输入框 |

## 配置文件

配置文件(`~/.qsconf.json`)举例：

```json
{
    "books": {
        "name": "books",
        "alias": "bk",
        "location": "/Users/kylqin/books",
        "fileExtensions": ["epub", "pdf", "mobi"],
        "collectFrom": ["/Users/kylqin/Downloads"]
    },
    "notes": {
        "name": "notes",
        "alias": "nt",
        "location": "/Users/kylqin/Documents/notes.d",
        "ignoreDirs": [".git"],
        "fileExtensions": ["md", "html", "xlsx"],
        "collectFrom": ["/Users/kylqin/Downloads"]
    }
}
```
