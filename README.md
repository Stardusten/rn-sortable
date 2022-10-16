# rn-sortable

A plugin that allows you to sort all child rems of a rem using custom rule in RemNote.

![image](https://user-images.githubusercontent.com/38722307/195976177-3078488a-c7d1-4b84-96ec-27b71a26d412.png)

![image](https://user-images.githubusercontent.com/38722307/195976875-0f78dd89-b3c7-4581-886c-f52c34735f54.png)


# About Sort Rules

| Syntax | Description |
|:-:|:-|
| `byStatus` | Unfinished Todos --> Finished Todos --> Other Rems |
| `byStatus+` | The same as `byStatus` |
| `byStatus-` | Contrary to `byStatus+` |
| `bySlotValue(Rating)` |  Sort by rating (specify like "Rating ;; 10"), in **ascending** order |
| `bySlotValue(Rating)-` | Sort by rating (specify like "Rating ;; 10"), in **descending** order |
| `byStatus, byText` | Sort by status first. If equal, sort by text next. | 
