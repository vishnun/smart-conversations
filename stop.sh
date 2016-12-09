PID=`ps -ef |grep SimpleHTTPServer |awk '{print $2}'`
`kill -9 $PID`