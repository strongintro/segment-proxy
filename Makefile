image = gcr.io/gio-compute/segment-proxy

.PHONY: deploy d

deploy d:
	docker build -t $(image) .
	gcloud docker push $(image)
	kubectl config use-context gke_gio-compute_us-central1-f_strongintro-prod
	kubectl delete pod -l name=segment-proxy
