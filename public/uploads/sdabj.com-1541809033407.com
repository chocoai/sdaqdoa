sdabj.com.		600	IN	SOA	dns9.hichina.com. hostmaster.hichina.com. 1541563859 3600 1200 86400 360
sdabj.com.		86400	IN	NS	dns9.hichina.com.
sdabj.com.		86400	IN	NS	dns10.hichina.com.
sdabj.com.		600	IN	MX	1 mx01.dm.aliyun.com.
sdabj.com.		600	IN	TXT	"v=spf1 include:spf1.dm.aliyun.com -all"
sdabj.com.		600	IN	A	47.90.4.9
aliyundm.sdabj.com.	600	IN	TXT	"f14c7ef31f9d4b6992f0"
www.sdabj.com.		600	IN	A	47.90.4.9
