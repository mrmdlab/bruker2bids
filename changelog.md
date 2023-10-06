## Todo
- fix dim_info, abandon fslorient
- select all, deselect all for studies and scans
- SelectScan.vue to be async
- save and load config
- automatic BISD conversion
    - 为了在扫描时可以直接出BIDS结果，可以每隔5秒检测一下有没有日期时间比“已选中的study中最老的”还要更新的study，全选其scan，增量转化（即只转化新增的，维护一个哈希表，如果不存在则转换，否则跳过）
## changelog
- abandon dicomifier
- get to post