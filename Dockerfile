FROM bitnami/apache:2.4

USER root
COPY app-httpd.conf /opt/bitnami/apache/conf/bitnami/bitnami.conf
COPY build /opt/bitnami/apache/htdocs/gridactions
RUN sed -i -e 's;<base href="\./"/>;<base href="<!--#echo var="BASE" -->"/>;' /opt/bitnami/apache/htdocs/gridactions/index.html
USER 1001
