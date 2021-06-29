FROM bitnami/apache:2.4

USER root
COPY app-httpd.conf /opt/binami/apache/conf/bitnami.conf
COPY build /opt/binami/apache/htdocs/gridactions
RUN sed -i -e 's;<base href="\./"/>;<base href="<!--#echo var="BASE" -->"/>;' /opt/binami/apache/htdocs/gridactions/index.html
USER 1001
